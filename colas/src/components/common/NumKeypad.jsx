import { Delete, Check, X } from "lucide-react";

export default function NumericKeypad({
  value,
  onAdd,
  onDelete,
  onConfirm,
  confirmDisabled,
}) {
  return (
  <div
    className="
      w-full

      max-w-[280px]
      xs:max-w-[300px]
      sm:max-w-[340px]
      md:max-w-[360px]

      mx-auto
    "
  >
    <div
      className="
        grid
        grid-cols-3

        gap-2
        sm:gap-3
        md:gap-4
      "
    >
      {/* NÚMEROS */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          onClick={() => onAdd(n.toString())}
          className="
            bg-white

            border-2
            border-slate-100

            text-slate-700

            text-xl
            sm:text-2xl
            md:text-3xl

            font-black

            h-[58px]
            sm:h-[68px]
            md:h-[76px]

            rounded-2xl

            shadow-sm

            hover:border-blue-400
            hover:text-blue-600
            hover:bg-blue-50

            active:scale-90

            transition-all
            duration-200

            flex
            items-center
            justify-center
          "
        >
          {n}
        </button>
      ))}

      {/* DELETE */}
      <button
        id="btn-delete"
        onClick={onDelete}
        disabled={value.length === 0}
        className={`
          ${
            value.length >= 1
              ? `
                bg-red-50
                text-red-500
                border-red-100
                hover:bg-red-100
              `
              : `
                bg-slate-50
                text-slate-300
                border-slate-100
                cursor-not-allowed
              `
          }

          border-2

          rounded-2xl

          transition-all
          duration-200

          active:scale-90

          flex
          items-center
          justify-center

          h-[58px]
          sm:h-[68px]
          md:h-[76px]
        `}
      >
        <X
          strokeWidth={3}
          className="
            w-5 h-5
            sm:w-6 sm:h-6
            md:w-7 md:h-7
          "
        />
      </button>

      {/* CERO */}
      <button
        onClick={() => onAdd("0")}
        className="
          bg-white

          border-2
          border-slate-100

          text-slate-700

          text-xl
          sm:text-2xl
          md:text-3xl

          font-black

          h-[58px]
          sm:h-[68px]
          md:h-[76px]

          rounded-2xl

          shadow-sm

          hover:border-blue-400
          hover:text-blue-600
          hover:bg-blue-50

          active:scale-90

          transition-all
          duration-200

          flex
          items-center
          justify-center
        "
      >
        0
      </button>

      {/* CONFIRM */}
      <button
        id="btn-accept"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`
          ${
            !confirmDisabled
              ? `
                bg-emerald-500
                text-white
                hover:bg-emerald-600
                shadow-emerald-200
              `
              : `
                bg-slate-200
                text-slate-400
                cursor-not-allowed
                shadow-none
              `
          }

          rounded-2xl

          shadow-lg

          transition-all
          duration-200

          active:scale-90

          flex
          items-center
          justify-center

          h-[58px]
          sm:h-[68px]
          md:h-[76px]
        `}
      >
        <Check
          strokeWidth={4}
          className="
            w-6 h-6
            sm:w-7 sm:h-7
            md:w-8 md:h-8
          "
        />
      </button>
    </div>
  </div>
);
}