// Adapted from Perfect Edition by Robin Sloan (MIT License, see blog/book/LICENSE): https://github.com/robinsloan/perfect-edition
  // -- Side-to-side scrolling support --

  // This is the function that kicks off a side-to-side page scroll.
  // It is taken from:
  // https://github.com/iamdustan/smoothscroll/blob/master/src/smoothscroll.js
  function smoothScroll(targetX, shouldTurnSlow) {
    const startTime = performance.now();
    const startX = document.body.scrollLeft;

    // After this initial invocation, the smoothScrollStep function
    // calls itself again & again until we've scrolled to targetX.
    smoothScrollStep({
      startTime: startTime,
      startX: startX || 0,
      targetX: targetX || 0,
      shouldTurnSlow: shouldTurnSlow
    });
  }

  // This easing function returns a relative "how far you should be"
  // value in the range 0.0-1.0 for an input "time elapsed" value,
  // also relative, in the range 0.0-1.0
  function ease(k) {
    return (-Math.pow(2, -10 * k) + 1);
  }

  const SCROLL_TIME_FAST = 200; // millis
  const SCROLL_TIME_SLOW = 1000; // millis

  // This function passes this status object back to itself
  // on successive animation frames: a way of keeping track
  // of how far it has scrolled & how far remains.
  function smoothScrollStep(status) {
    const scrollTime =
      status.shouldTurnSlow ? SCROLL_TIME_SLOW : SCROLL_TIME_FAST;
    let elapsedTime = (performance.now() - status.startTime) / scrollTime;

    // Just in case... avoid elapsed times higher than 1.0:
    elapsedTime = elapsedTime > 1.0 ? 1.0 : elapsedTime;

    // Apply easing to elapsed time:
    const easedValue = ease(elapsedTime);

    // Based on that easing curve, where should we be?
    const currentX =
      status.startX + (status.targetX - status.startX) * easedValue;

    document.body.scrollLeft = currentX;

    // If we haven't reached our destination yet ...
    if (Math.abs(currentX - status.targetX) > 2.0) {
      // ... keep scrolling!
      requestAnimationFrame(smoothScrollStep.bind(window, status));
    }
  }

  // -- Utility --

  // Look up the real pixel value of a property on the book DOM element
  function getComputed(propertyName) {
    return Number(
      getComputedStyle(bookElement)
        .getPropertyValue(propertyName)
        .replace("px", ""),
    );
  }

  // Look up the positioning rect of a DOM element
  function getRect(element) {
    // terrible hack for Firefox, which treats getBoundingClientRect as an
    // inner dimension for some unknown reason:
    const rects = element.getClientRects();
    return rects[rects.length - 1];
  }

  // -- Page turning --

  // First: here are legible aliases for our page turn functions.
  // The idea is to "say what you really want" elsewhere in this code
  // rather than cryptically call turnPage(-1, false)

  function turnPageForward() {
    turnPage(1, false);
  }

  function turnPageBack() {
    turnPage(-1, false);
  }

  function snapToCurrentPage() {
    turnPage(0, true);
  }

  // As you can tell from the functions above, turnPage accepts
  // a turnDirection parameter that can be
  //  1: turn forward
  // -1: turn back
  //  0: turn to "this page", i.e., re-center it
  function turnPage(turnDirection, shouldTurnSlow) {
    // Where are we?
    const currentLeftOffset = document.body.scrollLeft;

    // How wide is one page, currently?
    // TODO: maybe change these to `page*` instead of `column*`
    const columnWidth = getComputed("column-width");
    const columnGap = getComputed("column-gap");
    const columnTotal = columnWidth + columnGap;

    // Where are we, then, in terms of pages?
    const currentPageNumber = Math.round(currentLeftOffset / columnTotal);

    // Where do we want to be?
    const targetPageNumber = currentPageNumber + turnDirection;

    // Working backwards, what's the x-coordinate of the left edge
    // of our target page number?
    let closestPageEdge = targetPageNumber * columnTotal;

    // This is an edge case that I don't totally remember ...
    // It'll return to me at some point, I'm sure.
    // 8.0 pixels is for sure a magic number, sorry!
    if (Math.abs(closestPageEdge - currentLeftOffset) < 8.0) {
      closestPageEdge += columnTotal * turnDirection;
      writePageNumber(targetPageNumber + 1); // hacky
    }

    // Hold up -- you can't turn to the next page if you're at the
    // end of the book!
    if (
      (turnDirection > 0) &&
      (getRect(endElement).x <= (window.innerWidth + columnGap))
    ) {
      // If that's the case, return without scrolling:
      return;
    }

    // Now it's OK to write our page number:
    writePageNumber(targetPageNumber);

    // If we previously navigated using a chapter link, we want to clear
    // that hash out of the URL, because we're now on a different page:
    window.location.hash = "";

    // After all this, we are finally ready to scroll:
    smoothScroll(closestPageEdge, shouldTurnSlow);
  }

  // This function turns, without any animation, to a particular numbered page.
  // It's a bit flaky because "page numbers" can change completely based on
  // browser size -- this is a responsive, reflowable layout.
  // But, better to have the capability than not ... maybe?
  function turnToPage(pageNumber) {
    const columnWidth = getComputed("column-width");
    const columnGap = getComputed("column-gap");
    const columnTotal = columnWidth + columnGap;

    let pageEdge = pageNumber * columnTotal;
    if (pageEdge > bookElement.scrollWidth) {
      // In this case, the page number is greater than total number of pages
      // currently available. Again, this isn't uncommon, because of reflow.
      // So, we'll just go the end of the book.
      pageEdge = bookElement.scrollWidth - (columnTotal + columnWidth);
    }

    // Display the cute bookmark so people get the idea that they have
    // returned to a saved location:
    const bookmarkElement = document.querySelector("div.bookmark");
    bookmarkElement.style.display = "block";
    bookmarkElement.style.left = `${pageEdge + columnWidth / 2.0}px`;

    document.body.scrollLeft = pageEdge;
  }

  // This function turns, without any animation, to a particular hash,
  // which we use to link directly to a chapter.
  // The function expects the raw hash from the URL -- # included.
  function turnToChapter(rawHash) {
    // Convert the raw hash to the element id scheme used in the book HTML:
    const id = "chapter_" + rawHash.replace("#", "");

    // Now, find the <h2> element with that id.
    let targetHeading =
      Array.from(document.querySelectorAll("h2")).find((heading) => {
        return heading.getAttribute("id") == id;
      });

    targetHeading.scrollIntoView();

    // This gets us part of the way there ... but we have more to do.
    // scrollIntoView() doesn't know the niceties of our layout --
    // as long as the targetHeading is barely visible, it's happy.
    // WE HOWEVER ARE NOT.
    // To calculate the misalignment, we need to know where, in window
    // coordinates, the left edge of our page should be.
    // |------------------- window.innerWidth -------------------|
    //       this edge -> | bookElement.width |
    const wherePageEdgeShouldBe =
      (window.innerWidth - getRect(bookElement).width) / 2.0;

    // Next, we see how far off the mark we are:
    const misalignment = getRect(targetHeading).x - wherePageEdgeShouldBe;

    // Finally, we compensate:
    document.body.scrollLeft += misalignment;
  }

  // -- TOC and config --
  // These functions are all very simple and, I believe, self-explanatory.

  function setTextScale(scale) {
    document.documentElement.style.setProperty(
      "--font-size",
      `${BASE_FONT_SIZE * scale}px`,
    );
  }

  function toggleNav() {
    if (navElement == null) {
      return;
    }

    if (navElement.className == "invisible") {
      navElement.className = "visible";
    } else {
      navElement.className = "invisible";
    }
  }

  function writePageNumber(pageNumber) {
    window.localStorage.setItem("pageNumber:" + location.pathname, pageNumber);
  }

  function readPageNumber() {
    const pageNumber = Number(window.localStorage.getItem("pageNumber:" + location.pathname));
    if (pageNumber > 1) {
      turnToPage(pageNumber);
    }
  }

  // -- Setup --

  const CLICK_DEBOUNCE_TIME = 50; // millis
  const LONG_PRESS_TIME = 250; // millis

  const BASE_FONT_SIZE = 18.0; // px

  // These are globals where we will cache these elements
  // so we don't have to querySelector() them every time:
  var bookElement;
  var navElement;
  var endElement;

  // These are globals used to keep track of a few things used below:
  var scrollTimer;
  var lastMouseDown = Date.now();
  var lastClick = Date.now();

  // Here is the big setup function:
  document.addEventListener("DOMContentLoaded", (e) => {
    bookElement = document.querySelector("div.book");
    navElement = document.querySelector("nav"); // This might be null!
    endElement = document.querySelector("p.last-page");

    // Does the URL have a hash, indicating a link directly to a chapter?
    // The length check is > 1 because an empty hash "#" is length 1
    if (window.location.hash.length > 1) {
      turnToChapter(window.location.hash);
    } else {
      readPageNumber();
    }

    // Here's the scroll "re-adjustment" handler
    // After a free scroll, we wait for a beat (1000 millis, to be exact)
    // and then snap our scroll position to a page edge.
    // We put this here in the DOMContentLoaded handler because we need
    // this `body` element to be ready!
    document.body.addEventListener("scroll", (e) => {
      // Were we already waiting to snap? If so, forget that:
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      // Wait ... then snap:
      scrollTimer = setTimeout(() => {
        snapToCurrentPage();
      }, 1000);
    });

    // Handle click on the TOC button, if it exists:
    document.querySelector("button.toc-button")?.addEventListener("click", (e) => {
        toggleNav();
        e.stopPropagation();
    });

    // Handle click on the close button, if it exists:
    document.querySelector("div.close-button")?.addEventListener("click", (e) => {
        toggleNav();
        e.stopPropagation();
    });

    // Add click handlers to the chapter titles in the TOC, if they exist:
    document.querySelectorAll("nav a")?.forEach((link) => {
      link.addEventListener("click", (e) => {
        toggleNav();
        turnToChapter(e.target.getAttribute("href"));
        e.stopPropagation();
      });
    });

    // Add click handlers to the text scale options in the TOC, if they exist:
    document.querySelectorAll("nav div.controls button")?.forEach((button) => {
      const size = `${BASE_FONT_SIZE * button.dataset.scale}px`;
      button.style.fontSize = size;

      button.addEventListener("click", (e) => {
        setTextScale(e.target.dataset.scale);
        e.stopPropagation();
      });
    });

    // This next bit is hacky, but/and it allows us to respond appropriately
    // to user changes to overall browser font size, e.g. with ⌘+ and ⌘-.
    // We want our font size options to be built "around" that user-selected
    // font size ... right? (I might be overthinking this.)
    // We have to wrap this in a setTimeout because the computed font size,
    // reflecting the user-selected font size, isn't available at the moment
    // DOMContentLoaded fires -- shocking!
    setTimeout(function () {
      // So what IS the font-size of this document, reflecting any changes
      // by the user?
      let realFontSize = Number(
        getComputedStyle(document.documentElement)
          .getPropertyValue("font-size")
          .replace("px", ""),
      );

      // So ... basically we now redo what we did above, setting up those
      // click handlers for the text scale options.
      // (if they exist)
      document.querySelectorAll("nav div.controls button")?.forEach((button) => {
          const size = `${realFontSize * button.dataset.scale}px`;
          button.style.fontSize = size;

          button.addEventListener("click", (e) => {
            setTextScale(e.target.dataset.scale);
            e.stopPropagation();
        });
      });
    }, 1000); // end of setTimeout

    // TODO: The more I think about the text scale bit above, the more I think
    // it is dumb. Maybe there's a better/cleaner approach.
  });


  // -- More controls --
  // We can set these up outside the DOMContentLoaded handler, they are eternal

  // Handle keyboard controls:
  document.addEventListener("keydown", (e) => {
    // Left arrow
    if (event.keyCode === 37) {
      e.preventDefault();
      turnPageBack();
    }
    // Right arrow, space bar
    if ((event.keyCode === 39) || (event.keyCode === 32)) {
      e.preventDefault();
      turnPageForward();
    }
  });

  // Handle the scroll wheel:
  document.addEventListener("wheel", (e) => {
    // Don't override the scroll wheel if the user
    // is browsing the TOC.
    // Be sure to use safe navigation for the TOC element:
    if (navElement?.className == "visible") {
      return;
    }

    // I don't remember why we do this check
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      document.body.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // Keep track of mousedowns, to calculate timings for events below:
  document.addEventListener("mousedown", function (e) {
    lastMouseDown = Date.now();
  });

  // Handle clicks, which generally turn the page -- ALTHOUGH you might notice
  // that most of this code is devoted to looking for reasons NOT to turn
  // the page ...
  document.addEventListener("click", function (e) {
    const now = Date.now();

    // Don't turn the page on long press (e.g., mobile text selection).
    // "click" events register on mouseup, so we are saying, if it's been
    // a looong time since mousedown ... don't turn the page
    if ((now - lastMouseDown) > LONG_PRESS_TIME) {
      return;
    }

    // Don't turn the page on the second click in a double-click:
    if ((now - lastClick) < CLICK_DEBOUNCE_TIME) {
      lastClick = now;
      return;
    }

    // Still record the timing of this click:
    lastClick = now;

    // (Why are people double-clicking? I don't know.)

    // Don't turn page if the user clicked a link:
    if (e.target.tagName == "A") {
      return;
    }

    // Don't turn the page if the user is selecting text:
    if (window.getSelection().toString().length > 0) {
      return;
    }

    // Okay, there's no avoiding it ... turn the page.
    // Clicks in the left 1/3 of the screen turn back,
    // clicks in the right 2/3 turn forward
    if (e.clientX < (window.innerWidth / 3.0)) {
      turnPageBack();
    } else {
      turnPageForward();
    }
  });

  // Detect changes in the URL hash, which we use for chapter titles.
  // Note that this is a window event, not a document event
  window.addEventListener("hashchange", (e) => {
    if (window.location.hash.length > 1) {
      turnToChapter(window.location.hash);
    }
  });

