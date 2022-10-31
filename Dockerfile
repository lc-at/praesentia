FROM python:3.9-alpine
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["gunicorn", "-b", ":8000", "wsgi:app"]
EXPOSE 8000
