# docker build -t superfund:latest .
# docker tag superfund:latest gcr.io/shakticon-ctf/superfund:latest
# docker push gcr.io/shakticon-ctf/superfund:latest
# gcloud run deploy --image gcr.io/shakticon-ctf/superfund --platform managed
# # local
# docker run --name superfund --init -p 8080:8080 superfund:latest
FROM node:14.16-buster-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source
COPY server.js .
COPY public public

# Config and run
EXPOSE 8080
ENV NODE_ENV="production"
ENV FLAG="shaktictf{_3nv120nm3n741_ju571c3_}"
ENV ADMIN_PASSWORD="jloguVrx9TfGDJV1nA04jGoUxOny5XZG"
ENV DOMAIN="superfund.2r.is"
ENV PORT="8080"
ENV TLS="true"
#ENV DEBUG="yup" # or "express:*"

USER node
CMD ["node", "server.js"]