import { PubSub } from "apollo-server-express";
const pubsub = new PubSub();
const MESSAGE_CREATED = "MESSAGE_CREATED";

module.exports = {
  Query: {
    Messages: async (_, args, { Message }) => {
      //Messageのcontextからすべてのメッセージを降順で取得します。
      const messages = await Message.find({}).sort({ createdDate: "desc" });
      return messages;
    }
  },
  Mutation: {
    addMessage: async (_, { content }, { Message }) => {
      //Messageのcontextのインスタンスを生成し、contentの内容をmongooseを通してmongodbに保存し、pubsubを使ってsubscriptionしています。これで新規メッセージを投稿する度にリアルタイムで通知が行われます。
      const newMessage = await new Message({
        content
      }).save();
      await pubsub.publish(MESSAGE_CREATED, { messagesCreated: newMessage }); //ここでsubscriptionに通知をしています。
      return newMessage;
    }
  },
  //ここでpublishされたメッセージに対してasyncIteratorを使用して非同期でくるデータに対して反復処理をしています。
  Subscription: {
    messagesCreated: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_CREATED])
    }
  }
};
