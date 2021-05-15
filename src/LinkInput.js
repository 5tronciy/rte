import s from "./LinkInput.module.css";

export const LinkInput = () => {
  return (
    <div className={s.linkInputContainer}>
      <input placeholder="Paste or type a link..." />
    </div>
  );
};
