import { sleep } from "k6";
/**
 * Simulate users thinking between taking actions. Sleeps for 1-5 seconds
 * (randomly). This makes the load more realistic.
 */
export function thinkTime() {
   sleep(Math.floor(Math.random() * 5) + 1);
}
