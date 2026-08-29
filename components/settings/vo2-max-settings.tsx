"use client";

import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Activity,
  Check,
  ChevronDown,
  HeartPulse,
  Info,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";

const STORAGE_KEYS = {
  age: "performance_age",
  restingHeartRate: "performance_resting_hr",
  vo2Max: "performance_vo2_max",
} as const;

const DEFAULT_VALUES = {
  age: 25,
  restingHeartRate: 60,
  vo2Max: null as number | null,
};

interface StoredValues {
  age: number;
  restingHeartRate: number;
  vo2Max: number | null;
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

function readStoredValues(): StoredValues {
  if (typeof window === "undefined") {
    return DEFAULT_VALUES;
  }

  const storedAge = localStorage.getItem(
    STORAGE_KEYS.age,
  );

  const storedRestingHeartRate =
    localStorage.getItem(
      STORAGE_KEYS.restingHeartRate,
    );

  const storedVo2Max =
    localStorage.getItem(
      STORAGE_KEYS.vo2Max,
    );

  const age = Number(storedAge);

  const restingHeartRate = Number(
    storedRestingHeartRate,
  );

  const parsedVo2Max = Number(
    storedVo2Max,
  );

  return {
    age:
      Number.isInteger(age) &&
        age >= 10 &&
        age <= 100
        ? age
        : DEFAULT_VALUES.age,

    restingHeartRate:
      Number.isInteger(
        restingHeartRate,
      ) &&
        restingHeartRate >= 30 &&
        restingHeartRate <= 120
        ? restingHeartRate
        : DEFAULT_VALUES.restingHeartRate,

    vo2Max:
      Number.isFinite(parsedVo2Max) &&
        parsedVo2Max > 0
        ? parsedVo2Max
        : DEFAULT_VALUES.vo2Max,
  };
}

function getClientSnapshot(): string {
  return JSON.stringify(
    readStoredValues(),
  );
}

function getServerSnapshot(): string {
  return JSON.stringify(
    DEFAULT_VALUES,
  );
}

function subscribe(
  callback: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => { };
  }

  const handleStorage = (
    event: StorageEvent,
  ) => {
    if (
      event.key === null ||
      event.key === STORAGE_KEYS.age ||
      event.key ===
      STORAGE_KEYS.restingHeartRate ||
      event.key === STORAGE_KEYS.vo2Max
    ) {
      callback();
    }
  };

  const handleSettingsChange = () => {
    callback();
  };

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    "performance-settings-change",
    handleSettingsChange,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      "performance-settings-change",
      handleSettingsChange,
    );
  };
}

function useStoredValues(): StoredValues {
  const snapshot =
    useSyncExternalStore(
      subscribe,
      getClientSnapshot,
      getServerSnapshot,
    );

  return useMemo(() => {
    try {
      return JSON.parse(
        snapshot,
      ) as StoredValues;
    } catch {
      return DEFAULT_VALUES;
    }
  }, [snapshot]);
}

/* -------------------------------------------------------------------------- */
/* VO₂ Max calculation                                                        */
/* -------------------------------------------------------------------------- */

function calculateEstimatedVo2Max(
  age: number,
  restingHeartRate: number,
): number | null {
  if (
    !Number.isInteger(age) ||
    age < 10 ||
    age > 100
  ) {
    return null;
  }

  if (
    !Number.isInteger(
      restingHeartRate,
    ) ||
    restingHeartRate < 30 ||
    restingHeartRate > 120
  ) {
    return null;
  }

  const maximumHeartRate =
    220 - age;

  const result =
    15 *
    (maximumHeartRate /
      restingHeartRate);

  if (!Number.isFinite(result)) {
    return null;
  }

  return Number(
    result.toFixed(1),
  );
}

/* -------------------------------------------------------------------------- */
/* Fitness classification                                                     */
/* -------------------------------------------------------------------------- */

function getFitnessCategory(
  age: number,
  vo2Max: number,
) {
  let thresholds: [
    number,
    number,
    number,
  ];

  if (age < 30) {
    thresholds = [35, 42, 50];
  } else if (age < 40) {
    thresholds = [33, 40, 47];
  } else if (age < 50) {
    thresholds = [30, 37, 44];
  } else if (age < 60) {
    thresholds = [27, 34, 41];
  } else {
    thresholds = [24, 31, 38];
  }

  if (vo2Max < thresholds[0]) {
    return {
      label: "Developing",
      description:
        "Your aerobic fitness has plenty of room to grow.",
      percentage: 30,
      score: "Below average",
    };
  }

  if (vo2Max < thresholds[1]) {
    return {
      label: "Fair",
      description:
        "Your aerobic fitness is developing steadily.",
      percentage: 48,
      score: "Average",
    };
  }

  if (vo2Max < thresholds[2]) {
    return {
      label: "Good",
      description:
        "You have a solid aerobic fitness base.",
      percentage: 70,
      score: "Above average",
    };
  }

  return {
    label: "Excellent",
    description:
      "Your estimated aerobic fitness is excellent.",
    percentage: 92,
    score: "Excellent",
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Vo2MaxSettings() {
  const storedValues =
    useStoredValues();

  const [age, setAge] =
    useState(storedValues.age);

  const [
    restingHeartRate,
    setRestingHeartRate,
  ] = useState(
    storedValues.restingHeartRate,
  );

  const [vo2Max, setVo2Max] =
    useState<number | null>(
      storedValues.vo2Max,
    );

  const [vo2Input, setVo2Input] =
    useState(
      storedValues.vo2Max !== null
        ? String(
          storedValues.vo2Max,
        )
        : "",
    );

  const [saved, setSaved] =
    useState(false);

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Dynamic metrics                                                          */
  /* ------------------------------------------------------------------------ */

  const maximumHeartRate =
    age >= 10 && age <= 100
      ? 220 - age
      : null;

  const estimatedVo2Max =
    useMemo(
      () =>
        calculateEstimatedVo2Max(
          age,
          restingHeartRate,
        ),
      [
        age,
        restingHeartRate,
      ],
    );

  const displayedVo2Max =
    vo2Max !== null
      ? vo2Max
      : estimatedVo2Max;

  const fitnessCategory =
    useMemo(() => {
      if (
        displayedVo2Max === null
      ) {
        return null;
      }

      return getFitnessCategory(
        age,
        displayedVo2Max,
      );
    }, [
      age,
      displayedVo2Max,
    ]);

  /*
   * Ring score.
   *
   * The visual score is capped at 100.
   */
  const ringScore =
    fitnessCategory?.percentage ??
    0;

  const ringRadius = 74;

  const circumference =
    2 *
    Math.PI *
    ringRadius;

  const ringOffset =
    circumference -
    (ringScore / 100) *
    circumference;

  /* ------------------------------------------------------------------------ */
  /* Handlers                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleAgeChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        const value =
          event.target.value.replace(
            /\D/g,
            "",
          );

        setAge(
          value === ""
            ? 0
            : Number(value),
        );

        setSaved(false);
      },
      [],
    );

  const handleRestingHeartRateChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        const value =
          event.target.value.replace(
            /\D/g,
            "",
          );

        setRestingHeartRate(
          value === ""
            ? 0
            : Number(value),
        );

        setSaved(false);
      },
      [],
    );

  const handleVo2MaxChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        let value =
          event.target.value.replace(
            /[^0-9.]/g,
            "",
          );

        const firstDot =
          value.indexOf(".");

        if (firstDot !== -1) {
          value =
            value.slice(
              0,
              firstDot + 1,
            ) +
            value
              .slice(
                firstDot + 1,
              )
              .replace(
                /\./g,
                "",
              );
        }

        setVo2Input(value);

        if (value === "") {
          setVo2Max(null);
        } else {
          const parsed =
            Number(value);

          setVo2Max(
            Number.isFinite(parsed)
              ? parsed
              : null,
          );
        }

        setSaved(false);
      },
      [],
    );

  const handleSave =
    useCallback(() => {
      if (
        !Number.isInteger(age) ||
        age < 10 ||
        age > 100
      ) {
        return;
      }

      if (
        !Number.isInteger(
          restingHeartRate,
        ) ||
        restingHeartRate < 30 ||
        restingHeartRate > 120
      ) {
        return;
      }

      localStorage.setItem(
        STORAGE_KEYS.age,
        String(age),
      );

      localStorage.setItem(
        STORAGE_KEYS.restingHeartRate,
        String(
          restingHeartRate,
        ),
      );

      const parsedVo2Max =
        Number(vo2Input);

      if (
        vo2Input !== "" &&
        Number.isFinite(
          parsedVo2Max,
        ) &&
        parsedVo2Max > 0
      ) {
        const normalized =
          Number(
            parsedVo2Max.toFixed(
              1,
            ),
          );

        localStorage.setItem(
          STORAGE_KEYS.vo2Max,
          String(normalized),
        );

        setVo2Max(normalized);
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.vo2Max,
        );

        setVo2Max(null);
      }

      window.dispatchEvent(
        new Event(
          "performance-settings-change",
        ),
      );

      setSaved(true);
    }, [
      age,
      restingHeartRate,
      vo2Input,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-border/70
        bg-card
        shadow-sm
      "
    >
      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      <div
        className="
          relative
          overflow-hidden
          border-b
          border-border/70
          bg-linear-to-br
          from-[#fff7f3]
          via-card
          to-background
          px-4
          py-6
          sm:px-6
          sm:py-8
          md:px-8
          md:py-10
        "
      >
        {/* Decorative glow */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            size-52
            rounded-full
            bg-[#FC4C02]/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            grid
            grid-cols-1
            items-center
            gap-7
            lg:grid-cols-[1fr_auto]
            lg:gap-10
          "
        >
          {/* Left */}
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#FC4C02]
                  text-white
                  shadow-sm
                "
              >
                <Activity className="size-4.5" />
              </div>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[#FC4C02]
                  "
                >
                  Aerobic Fitness
                </p>

                <h2
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    sm:text-xl
                  "
                >
                  VO₂ Max
                </h2>
              </div>
            </div>

            <p
              className="
                mt-4
                max-w-md
                text-xs
                leading-5
                text-muted-foreground
                sm:text-sm
              "
            >
              A snapshot of your
              aerobic capacity based
              on your personal
              fitness profile.
            </p>

            {fitnessCategory && (
              <div
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#FC4C02]/15
                  bg-white/70
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-[#FC4C02]
                  shadow-sm
                "
              >
                <Sparkles className="size-3.5" />

                {fitnessCategory.label}

                <span
                  className="
                    font-normal
                    text-muted-foreground
                  "
                >
                  · {fitnessCategory.score}
                </span>
              </div>
            )}
          </div>

          {/* Ring */}
          <div
            className="
              relative
              mx-auto
              flex
              size-47.5
              items-center
              justify-center
              sm:size-53.75
              lg:mx-0
            "
          >
            <svg
              viewBox="0 0 190 190"
              className="
                absolute
                inset-0
                size-full
                -rotate-90
              "
            >
              <circle
                cx="95"
                cy="95"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-border/50"
              />

              <circle
                cx="95"
                cy="95"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                className="
                  text-[#FC4C02]
                  transition-all
                  duration-700
                "
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  ringOffset
                }
              />
            </svg>

            <div
              className="
                relative
                flex
                flex-col
                items-center
                text-center
              "
            >
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-muted-foreground
                "
              >
                Current
              </span>

              <span
                className="
                  mt-1
                  text-4xl
                  font-black
                  tracking-normal
                  sm:text-5xl
                "
              >
                {displayedVo2Max !==
                  null
                  ? displayedVo2Max.toFixed(
                    1,
                  )
                  : "—"}
              </span>

              <span
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-muted-foreground
                "
              >
                ml/kg/min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* QUICK METRICS                                                      */}
      {/* ================================================================== */}

      <div
        className="
          grid
          grid-cols-2
          divide-x
          divide-border/70
          border-b
          border-border/70
          sm:grid-cols-3
        "
      >
        {/* Age */}
        <div className="p-4 sm:p-5">
          <div
            className="
              flex
              items-center
              gap-2
              text-muted-foreground
            "
          >
            <UserRound className="size-3.5" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
              "
            >
              Age
            </span>
          </div>

          <p
            className="
              mt-2
              text-lg
              font-bold
              tracking-tight
            "
          >
            {age || "—"}
            <span
              className="
                ml-1
                text-[10px]
                font-normal
                text-muted-foreground
              "
            >
              yrs
            </span>
          </p>
        </div>

        {/* Resting HR */}
        <div className="p-4 sm:p-5">
          <div
            className="
              flex
              items-center
              gap-2
              text-muted-foreground
            "
          >
            <HeartPulse className="size-3.5" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
              "
            >
              Resting HR
            </span>
          </div>

          <p
            className="
              mt-2
              text-lg
              font-bold
              tracking-tight
            "
          >
            {restingHeartRate ||
              "—"}
            <span
              className="
                ml-1
                text-[10px]
                font-normal
                text-muted-foreground
              "
            >
              bpm
            </span>
          </p>
        </div>

        {/* Max HR */}
        <div
          className="
            col-span-2
            border-t
            border-border/70
            p-4
            sm:col-span-1
            sm:border-t-0
            sm:p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-muted-foreground
            "
          >
            <Zap className="size-3.5" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
              "
            >
              Est. Max HR
            </span>
          </div>

          <p
            className="
              mt-2
              text-lg
              font-bold
              tracking-tight
            "
          >
            {maximumHeartRate ||
              "—"}
            <span
              className="
                ml-1
                text-[10px]
                font-normal
                text-muted-foreground
              "
            >
              bpm
            </span>
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* INSIGHT                                                             */}
      {/* ================================================================== */}

      {fitnessCategory &&
        displayedVo2Max !== null && (
          <div
            className="
              border-b
              border-border/70
              p-4
              sm:p-5
              md:p-6
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-[#FC4C02]/10
                bg-[#FFF8F5]
                p-4
                sm:p-5
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    size-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#FC4C02]/10
                    text-[#FC4C02]
                  "
                >
                  <TrendingUp className="size-4" />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-bold
                      "
                    >
                      Your aerobic profile
                    </p>

                    <span
                      className="
                        rounded-full
                        bg-[#FC4C02]/10
                        px-2
                        py-0.5
                        text-[9px]
                        font-bold
                        text-[#FC4C02]
                      "
                    >
                      {fitnessCategory.label}
                    </span>
                  </div>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {
                      fitnessCategory.description
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ================================================================== */}
      {/* PERSONALIZE                                                         */}
      {/* ================================================================== */}

      <div className="p-4 sm:p-5 md:p-6">
        <button
          type="button"
          onClick={() =>
            setShowAdvanced(
              (current) =>
                !current,
            )
          }
          className="
            flex
            w-full
            items-center
            justify-between
            gap-4
            text-left
          "
        >
          <div>
            <p
              className="
                text-sm
                font-bold
              "
            >
              Personalize your estimate
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-4
                text-muted-foreground
              "
            >
              Adjust your personal
              profile for a more
              relevant estimate.
            </p>
          </div>

          <div
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-muted
            "
          >
            <ChevronDown
              className={`
                size-4
                transition-transform
                duration-200
                ${showAdvanced
                  ? "rotate-180"
                  : ""
                }
              `}
            />
          </div>
        </button>

        {showAdvanced && (
          <div
            className="
              mt-5
              space-y-5
              border-t
              border-border/70
              pt-5
            "
          >
            {/* Inputs */}
            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* Age */}
              <div>
                <label
                  htmlFor="vo2-age"
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-semibold
                  "
                >
                  Age
                </label>

                <div className="relative">
                  <input
                    id="vo2-age"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={
                      age === 0
                        ? ""
                        : age
                    }
                    onChange={
                      handleAgeChange
                    }
                    placeholder="25"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-3
                      pr-14
                      text-sm
                      outline-none
                      transition
                      focus:border-[#FC4C02]
                      focus:ring-2
                      focus:ring-[#FC4C02]/10
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    years
                  </span>
                </div>

                {age !== 0 &&
                  (age < 10 ||
                    age > 100) && (
                    <p
                      className="
                        mt-1.5
                        text-[10px]
                        text-red-500
                      "
                    >
                      Enter an age
                      between 10 and
                      100.
                    </p>
                  )}
              </div>

              {/* Resting HR */}
              <div>
                <label
                  htmlFor="vo2-resting-hr"
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-semibold
                  "
                >
                  Resting Heart Rate
                </label>

                <div className="relative">
                  <input
                    id="vo2-resting-hr"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={
                      restingHeartRate ===
                        0
                        ? ""
                        : restingHeartRate
                    }
                    onChange={
                      handleRestingHeartRateChange
                    }
                    placeholder="60"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-3
                      pr-14
                      text-sm
                      outline-none
                      transition
                      focus:border-[#FC4C02]
                      focus:ring-2
                      focus:ring-[#FC4C02]/10
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    bpm
                  </span>
                </div>

                {restingHeartRate !==
                  0 &&
                  (restingHeartRate <
                    30 ||
                    restingHeartRate >
                    120) && (
                    <p
                      className="
                        mt-1.5
                        text-[10px]
                        text-red-500
                      "
                    >
                      Enter a value
                      between 30 and
                      120 bpm.
                    </p>
                  )}
              </div>
            </div>

            {/* Estimate */}
            <div
              className="
                flex
                flex-col
                gap-3
                rounded-2xl
                bg-muted/40
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Target className="size-4 text-[#FC4C02]" />

                  <p
                    className="
                      text-xs
                      font-bold
                    "
                  >
                    Calculated estimate
                  </p>
                </div>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-muted-foreground
                  "
                >
                  Based on age and
                  resting heart rate.
                </p>
              </div>

              <div
                className="
                  text-left
                  sm:text-right
                "
              >
                <span
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  {estimatedVo2Max !==
                    null
                    ? estimatedVo2Max
                    : "—"}
                </span>

                <span
                  className="
                    ml-1
                    text-[10px]
                    text-muted-foreground
                  "
                >
                  ml/kg/min
                </span>
              </div>
            </div>

            {/* Manual override */}
            <div>
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >
                <label
                  htmlFor="vo2-manual"
                  className="
                    text-[11px]
                    font-semibold
                  "
                >
                  Measured VO₂ Max
                </label>

                <span
                  className="
                    text-[9px]
                    text-muted-foreground
                  "
                >
                  Optional
                </span>
              </div>

              <div className="relative">
                <input
                  id="vo2-manual"
                  type="text"
                  inputMode="decimal"
                  value={vo2Input}
                  onChange={
                    handleVo2MaxChange
                  }
                  placeholder={
                    estimatedVo2Max !==
                      null
                      ? String(
                        estimatedVo2Max,
                      )
                      : "e.g. 45.2"
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-background
                    px-3
                    pr-24
                    text-sm
                    outline-none
                    transition
                    focus:border-[#FC4C02]
                    focus:ring-2
                    focus:ring-[#FC4C02]/10
                  "
                />

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-[10px]
                    text-muted-foreground
                  "
                >
                  ml/kg/min
                </span>
              </div>

              <p
                className="
                  mt-2
                  flex
                  items-start
                  gap-1.5
                  text-[9px]
                  leading-4
                  text-muted-foreground
                "
              >
                <Info className="mt-0.5 size-3 shrink-0" />

                Leave empty to use
                the calculated
                estimate.
              </p>
            </div>

            {/* Save */}
            <div
              className="
                flex
                flex-col
                gap-3
                border-t
                border-border/70
                pt-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  text-[9px]
                  leading-4
                  text-muted-foreground
                "
              >
                Your profile is
                stored locally on
                this device.
              </p>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  !Number.isInteger(
                    age,
                  ) ||
                  age < 10 ||
                  age > 100 ||
                  !Number.isInteger(
                    restingHeartRate,
                  ) ||
                  restingHeartRate <
                  30 ||
                  restingHeartRate >
                  120
                }
                className="
                  inline-flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#FC4C02]
                  px-5
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#e94400]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:w-auto
                "
              >
                {saved ? (
                  <>
                    <Check className="size-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save profile
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* FOOTNOTE                                                            */}
      {/* ================================================================== */}

      <div
        className="
          flex
          items-start
          gap-2
          border-t
          border-border/70
          bg-muted/20
          px-4
          py-3
          sm:px-5
        "
      >
        <Info
          className="
            mt-0.5
            size-3.5
            shrink-0
            text-muted-foreground
          "
        />

        <p
          className="
            text-[9px]
            leading-4
            text-muted-foreground
          "
        >
          VO₂ Max shown here is an estimated fitness metric and is not a medical measurement.
        </p>
      </div>
    </section>
  );
}