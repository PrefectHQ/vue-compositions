import { subscribe } from "@/subscribe";
import Manager from "@/subscribe/manager";
import Subscription from "@/subscribe/subscription";
import { Action, ActionArguments, SubscriptionOptions } from "@/subscribe/types";

export function timeout(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function uniqueSubscribe<T extends Action>(
    action: T,
    args: ActionArguments<T>,
    options: SubscriptionOptions = {},
    manager: Manager = new Manager()
  ): Subscription<T> {
    return subscribe(action, args, options, new Manager())
}