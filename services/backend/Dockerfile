# pull official base image
FROM python:3.8.2-slim-buster

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy project
COPY . /usr/src/app/

# install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD python crossword.py -p 5000
