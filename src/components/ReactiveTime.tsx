import { createTimeAgo } from "@solid-primitives/date";
import { Show, type VoidComponent } from "solid-js";

interface ReactiveTimeProps {
  time: Date;
}

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export const ReactiveTime: VoidComponent<ReactiveTimeProps> = (props) => {
  const [timeAgo] = createTimeAgo(props.time, {
    min: 10000,
    interval: 10000,
  });

  const showDate = () => {
    // check if difference is more than a day
    const now = new Date();
    return now.getDate() !== props.time.getDate();
  };

  const dateString = () => {
    // if the date is ahead of the current date, and is less than a week ahead, show the day of the week
    // otherwise, show the full date
    const now = new Date();
    const diff = props.time.getDate() - now.getDate();
    if (diff > 0 && diff < 7) {
      return props.time.toLocaleDateString(undefined, { weekday: "long" });
    }
    return props.time.toLocaleDateString();
  };

  return (
    <span>
      {capitalize(timeAgo())} (<Show when={showDate}>{dateString()}, </Show>
      {props.time.toLocaleTimeString()})
    </span>
  );
};
