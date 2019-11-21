const fs = require("fs");
const path = require("path");

//apollo関連
import { ApolloServer } from "apollo-server-express";
const express = require("express");
import { createServer } from "http";

//schema,resolver関連
import resolvers from "./resolvers.js";
const filepath = path.join(__dirname, "typeDefs.graphql");
const typeDefs = fs.readFileSync(filepath, "utf-8");

//model
const { Message } = require("./models/Message");

// MONGOOSE接続部分
const mongoose = require("mongoose");

//conncectに書いてあるURLは適宜変更してください。また、通常はenvファイルなどで管理するようにして下さい。
// URLの例 mongodb+srv://*****/:****@cluster0-9v8cy.mongodb.net/test?retryWrites=true&w=majority

mongoose
  .connect(
    "URL",
    {
      useNewUrlParser: true,
      useFindAndModify: false
    }
  )
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

//サーバ立ち上げ
const server = new ApolloServer({
  //ここで上記で作ったファイルを含めています。
  typeDefs,
  resolvers,
  //ここでreturnされたcontextをresolversの第三引数で使用する事ができます。
  context: async ({ req, connection }) => {
    return { Message };
  },
  playground: true,
  introspection: true
});

const app = express();
server.applyMiddleware({ app, path: "/graphql" });

//subscription(リアルタイム通信設定部分)
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
