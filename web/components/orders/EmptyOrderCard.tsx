import type { FC } from "react";

type EmptyOrderCardProps = {
  text: string;
};

/**
 * A simple indicator card to show when a list is empty.
 *
 * This component renders a styled container with a placeholder message,
 * typically used to indicate that there are no orders to display.
 *
 * @param props.text  The text content to display inside the card.
 */
const EmptyOrderCard: FC<EmptyOrderCardProps> = ({ text }) => (
  <div
    className={`
      rounded-lg border border-outline bg-surface-container p-3 px-4 select-none
    `}
  >
    <p className="text-body-sm opacity-50">{text}</p>
  </div>
);

export default EmptyOrderCard;
