import CTooltip, { type RootProps } from "@corvu/tooltip";
import type { JSX, ParentComponent } from "solid-js";
import { createSignal, splitProps } from "solid-js";

import styles from "./Tooltip.module.scss";

type CorvuTooltipProps = Parameters<typeof CTooltip.Trigger>[0];
interface TooltipProps extends CorvuTooltipProps {
  children: JSX.Element;
  tooltipText: JSX.Element;
  placement?: RootProps["placement"];
  openDelay?: number;
  group?: string | true;
}

export const Tooltip: ParentComponent<TooltipProps> = (props) => {
  const [open, setOpen] = createSignal(false);

  const [local, others] = splitProps(props, ["tooltipText", "placement", "openDelay", "group"]);

  return (
    <CTooltip onOpenChange={setOpen} placement={local.placement} openDelay={local.openDelay} group={local.group}>
      <CTooltip.Anchor>
        <CTooltip.Trigger {...others}></CTooltip.Trigger>
      </CTooltip.Anchor>
      <CTooltip.Portal>
        <CTooltip.Content
          class={`${styles.tooltip__content} z-10 inline-block max-w-sm border border-neutral-300 rounded-lg bg-white p-2 px-2.5 dark:(border-neutral-600 bg-neutral-700 text-neutral-100)`}
        >
          <CTooltip.Arrow class="text-white dark:(border-neutral-600 text-neutral-700 text-neutral-100)" />
          <p>{local.tooltipText}</p>
        </CTooltip.Content>
      </CTooltip.Portal>
    </CTooltip>
  );
};
