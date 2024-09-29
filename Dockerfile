FROM node:20-slim

WORKDIR /tests
COPY . .
RUN npm install
CMD ["npm", "test"]
