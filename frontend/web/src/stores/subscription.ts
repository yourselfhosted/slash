import { PlanType } from "@/types/proto/api/v1/subscription_service";

export const stringifyPlanType = (planType: PlanType) => {
  if (planType === PlanType.FREE) {
    return "Free";
  } else if (planType === PlanType.PRO) {
    return "Pro";
  } else {
    return "Unknown";
  }
};
