import mongoose from "mongoose";
import EventEmitter from "events";

class ConnectionState extends EventEmitter {
  connected = false;
  connecting = false;
  error = null;
}

const connectionState = new ConnectionState();

const connect = async () => {
  connectionState.connecting = true;
  console.log("Database connecting...");

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    connectionState.connected = true;
    console.log("Database Connected!");
  } catch (error) {
    connectionState.error = error;
    console.error("Connection error:", error.stack || error);
  } finally {
    connectionState.connecting = false;
  }
};

// Handle mongoose connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to the database.");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from the database.");
});

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    connectionState.connected = false;
    console.log("Database is disconnected");
  } catch (error) {
    console.error("Error while disconnecting:", error);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnect();
  console.log("Application exited. Database connection closed.");
  process.exit(0);
});

export { connectionState, connect, disconnect };
