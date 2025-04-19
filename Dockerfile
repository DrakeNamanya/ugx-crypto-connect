# Use an official Python runtime
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Copy local files to the container
COPY . .

# Install dependencies
RUN pip install flask python-dotenv

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["python", "app.py"]
