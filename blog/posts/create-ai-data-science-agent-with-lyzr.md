---
title: Create AI Data Science Agent with Lyzr
date: 2024-01-12
description: Build a Streamlit app that analyses and plots any CSV with the Lyzr SDK, in about 20 lines of Python.
source: https://medium.com/@rohanbalkondekar/create-ai-data-science-agent-with-lyzr-286ff5199b15
---

![](https://cdn-images-1.medium.com/max/800/1*KK2UVxplCghdk0c2XSwYug.png)

Here’s the code:

```
import streamlit as st
import pandas as pd
from lyzr import DataAnalyzr # pip install lyzr

df = pd.read_csv("./cars_prices.csv") # set path to your data
data_analyzr = DataAnalyzr(df=df, api_key="sk-") # Pass the Dataframe and Your OpenAI API key

if "messages" not in st.session_state:
    st.session_state.messages = (
        [{"role": "assistant", "content": "Ask Question related to data"}]
    )

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Ask A Question", key="chat"):
    st.chat_message("user").markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.spinner("Analysing..."):
        text_response = data_analyzr.analysis_insights(user_input=prompt)

    with st.chat_message("assistant"):
        st.markdown(text_response)

    st.session_state.messages.append({"role": "assistant", "content": text_response})
```

There you go.   
With 20 lines of code, this app should serve 70% of the users out there

Want to build a more robust app, that can also plot graphs for you?

Follow Along!

![](https://cdn-images-1.medium.com/max/800/1*vMg1vHxuDp0igOwRXggmOQ.png)

Data science is not just about crunching numbers; it’s about making data compellingly tell its story.

Interactive data science apps bring this story to life, bridging the gap between complex analysis and the end user.

Today, let’s learn to utilize the \`Lyzr SDK\` in tandem with Streamlit to craft a web-based app that can analyze and visualize user-provided data.

Here, we’ll harness intelligent analytics powered by OpenAI’s GPT-3.5-turbo model.

#### **Prerequisites**

Before diving in, install Streamlit and Lyzr SDK:

```
pip install streamlit lyzr
```

#### **Essential Imports**

Import the required modules from both Lyzr and Streamlit:

```
from lyzr import DataAnalyzr, DataConnector
import streamlit as st
import io # To handle the image stream for visualizations
```

#### Building the User Interface

Kick-off by gathering user inputs — the OpenAI API key and their data:

```
openai_api_key = st.text_input("Enter your OpenAI API key:", type="password")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")p
```

Validate the inputs to ensure we can move forward confidently:

```
error_messages = []

if uploaded_file is None:
    error_messages.append('Please upload a CSV file.')
if not openai_api_key:
    error_messages.append('Please enter an OpenAI API key.')

if error_messages:
    for error in error_messages:
        st.error(error)
```

#### **The Core Functionality**

Upon successful input validation, the real magic begins:

```
if not error_messages:
    # Read the uploaded CSV file into a Pandas DataFrame via Lyzr's DataConnector
    df = DataConnector().fetch_dataframe_from_csv(file_path=uploaded_file)
    
    # Create a DataAnalyzr instance with the DataFrame and OpenAI API key
    data_analyzr = DataAnalyzr(df=df, api_key=openai_api_key) # You can pass `model_name="gpt-4"` to use GPT-4
    
    # Request a text query for analysis from the user
    analysis_query = st.text_input("### Enter your query related to the data:")
    
    # Provide an 'Analyze' button for the user to initiate the analysis
    analyze_clicked = st.button('Analyze')
    
    # If the button is clicked and a query is provided, start the analysis process
    if analyze_clicked and analysis_query:
        with st.spinner("Analyzing..."):
            try:
                # Use Lyzr's analysis function to get insights based on the user's query
                analysis = data_analyzr.analysis_insights(user_input=analysis_query)
                
                # Display the insights returned by the Lyzr analysis function
                st.write(analysis)
                st.success("Analysis complete!")
            except Exception as e:
                # Catch any exceptions during analysis and display an error message
                st.error(f"An error occurred during analysis: {e}")
```

#### **The Workflow Breakdown:**

1.  **Reading the Data**: The first line within the code block reads the user-uploaded CSV file and stores it as a Pandas DataFrame using Lyzr’s \`DataConnector\`. You can also connect to other sources of structured data such as Snowflake, Redshift, BigQuery and more using \`DataConnector\`

2\. **Instantiating DataAnalyzr**: We create an instance of \`DataAnalyzr\` passing the newly created DataFrame and the OpenAI API key provided by the user. This sets up our analysis engine.

3\. **Capturing User Query**: A text input is presented to the user where they can type their analysis query related to their data.

4\. **Analyzing Data**: Should the user press the ‘Analyze’ button and enter a query, the app enters the analysis phase. A spinner shows that the process has started.

5\. **Processing the Analysis**: Using the \`DataAnalyzr\` instance, we call \`analysis\_insights\` with the user’s query to perform the analysis, leveraging OpenAI’s models in the backend.

6\. **Presenting Results**: If successful, the analysis result is displayed to the user directly in the app interface, signifying the completion of the analysis.

7\. **Handling Exceptions**: If there’s an issue during the analysis (e.g., a bad query or a problem with the API), an error message is shown to the user, providing feedback that something went wrong.

#### **Handeling Visualizations:**

```
    # Same request and button process for visualization
    visualization_query = st.text_input("### Enter your visualization query related to the data:")
    visualize_clicked = st.button('Visualize')
    
    # Visualization initiation upon button click
    if visualize_clicked and visualization_query:
        with st.spinner("Visualizing..."):
            try:
                # The visualizations function returns a dictionary of image titles to their byte content
                visualizations = data_analyzr.visualizations(user_input=visualization_query)
                
                # Loop through the returned dictionary, converting byte content to images and display
                for image_name, image_bytes in visualizations.items():
                    image = io.BytesIO(image_bytes)  # Convert byte content to a stream
                    st.image(image, use_column_width=True)  # Display the image in Streamlit
            except Exception as e:
                st.error(f"An error occurred during visualization: {e}")
```

**\### The Workflow Breakdown:**

1\. **Query for Visualization**: Similar to the analysis portion, we ask for a user’s input with a text field tailored for visualization queries.

2\. **Triggering Visualization**: A ‘Visualize’ button is presented. Once clicked, it will start the process to create visual representations based on the user’s query.

3\. **Creating Visualizations**: When the visualization process is initiated, \`DataAnalyzr\` again taps into its underlying models to generate corresponding visual outputs.

4\. **Displaying Images**: As the visualizations are returned as a dictionary of byte streams, we iterate through them, converting each byte stream into an image object with \`io.BytesIO\` and then display it using Streamlit’s \`st.image\` function.

5\. **Error Feedback**: If any issue arises, for instance with the visualization query or the underlying Lyzr function, it is caught and displayed as an error message to the user.

#### **Handling Errors**

Finally, if any errors were detected earlier, we inform the user:

```
else:
    for error in error_messages:
        st.error(error)
```

#### **Error Communication:**

\- If the user failed to provide the required CSV file or OpenAI API key, the list \`error\_messages\` would be populated.

\- When processing the \`if not error\_messages:\` conditions, if errors exist, the \`else:\` block is executed instead.

\- Within this block, each error is presented using Streamlit’s \`st.error()\` function, providing clear feedback to the user.

The code snippets above is the heart of our data science app. After confirming the absence of input errors, we commence by converting the uploaded CSV file into a Pandas DataFrame using \`DataConnector\`. This DataFrame is then passed to \`DataAnalyzr\` along with the OpenAI API key to equip our app with Lyzr’s analysis prowess.

In conclusion, by combining the analytical capabilities of the Lyzr SDK with the ease of Streamlit’s UI components, we’ve crafted an app that not only performs sophisticated analyses but also presents visual stories from raw data, all at the user’s fingertips.

For more info check out [GitHub](https://github.com/LyzrCore/lyzr), [Documentation](https://docs.lyzr.ai/lyzr-sdk/opensource/data-analyzr/) or join [Discord](https://discord.gg/gmvjgszX)

Happy Analyzing!
