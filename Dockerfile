# Use image node js
FROM node:alpine

# Update alpine and add and update certificate
RUN apk update && apk add ca-certificates && update-ca-certificates

# Create directory in container
RUN mkdir /app

# Add all app to directory `app`
ADD . /app

# Set workdir
WORKDIR /app

# Get docker compose wait sebuah package untuk menunggu
# container yang ditunggu berjalan baru container selanjutnya dijalankan
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN chmod +x /wait

# Install dependecies
RUN npm install

EXPOSE 3000

# Start app
CMD /wait && npm start