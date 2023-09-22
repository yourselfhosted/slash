import { createChannel, createClientFactory, FetchTransport } from "nice-grpc-web";
import { SubscriptionServiceDefinition } from "./types/proto/api/v2/subscription_service";
import { UserServiceDefinition } from "./types/proto/api/v2/user_service";
import { UserSettingServiceDefinition } from "./types/proto/api/v2/user_setting_service";
import { WorkspaceServiceDefinition } from "./types/proto/api/v2/workspace_service";

const address = import.meta.env.MODE === "development" ? "http://localhost:8082" : window.location.origin;

const channel = createChannel(
  address,
  FetchTransport({
    credentials: "include",
  })
);

const clientFactory = createClientFactory();

export const subscriptionServiceClient = clientFactory.create(SubscriptionServiceDefinition, channel);

export const workspaceServiceClient = clientFactory.create(WorkspaceServiceDefinition, channel);

export const userServiceClient = clientFactory.create(UserServiceDefinition, channel);

export const userSettingServiceClient = clientFactory.create(UserSettingServiceDefinition, channel);
