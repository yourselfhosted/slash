import { createChannel, createClientFactory, FetchTransport } from "nice-grpc-web";
import { AuthServiceDefinition } from "./types/proto/api/v1/auth_service";
import { CollectionServiceDefinition } from "./types/proto/api/v1/collection_service";
import { ShortcutServiceDefinition } from "./types/proto/api/v1/shortcut_service";
import { SubscriptionServiceDefinition } from "./types/proto/api/v1/subscription_service";
import { UserServiceDefinition } from "./types/proto/api/v1/user_service";
import { UserSettingServiceDefinition } from "./types/proto/api/v1/user_setting_service";
import { WorkspaceServiceDefinition } from "./types/proto/api/v1/workspace_service";

const address = import.meta.env.MODE === "development" ? "http://localhost:8082" : window.location.origin;

const channel = createChannel(
  address,
  FetchTransport({
    credentials: "include",
  })
);

const clientFactory = createClientFactory();

export const workspaceServiceClient = clientFactory.create(WorkspaceServiceDefinition, channel);

export const subscriptionServiceClient = clientFactory.create(SubscriptionServiceDefinition, channel);

export const authServiceClient = clientFactory.create(AuthServiceDefinition, channel);

export const userServiceClient = clientFactory.create(UserServiceDefinition, channel);

export const userSettingServiceClient = clientFactory.create(UserSettingServiceDefinition, channel);

export const shortcutServiceClient = clientFactory.create(ShortcutServiceDefinition, channel);

export const collectionServiceClient = clientFactory.create(CollectionServiceDefinition, channel);
