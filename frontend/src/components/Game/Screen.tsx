import Field from "./Field";

export default function Screen() {
  return (
    <div className="w-full h-full bg-bg flex items-center justify-center overflow-hidden rounded-xl">
      <div className="h-full aspect-12/7 max-w-full rounded-xl overflow-hidden">
        <Field />
      </div>
    </div>
  );
}
