import { useEffect, useRef, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* =========================================
   HELPERS
========================================= */

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i -= 1) {
    days.push({
      date: new Date(year, month - 1, daysInPreviousMonth - i),
      currentMonth: false,
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  // Next month's days
  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(year, month + 1, nextDay),
      currentMonth: false,
    });

    nextDay += 1;
  }

  return days;
};

/* =========================================
   COMPONENT
========================================= */

const DatePicker = ({ value = "", onChange, onClear }) => {
  const selectedDate = parseDate(value);
  const today = new Date();

  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("calendar");

  const [viewDate, setViewDate] = useState(
    selectedDate ||
      new Date(today.getFullYear(), today.getMonth(), 1)
  );

  /* =========================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setView("calendar");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================
     SYNC WITH SELECTED DATE
  ========================================= */

  useEffect(() => {
    if (selectedDate) {
      setViewDate(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
      );
    }
  }, [value]);

  /* =========================================
     MONTH NAVIGATION
  ========================================= */

  const changeMonth = (amount) => {
    setViewDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + amount,
          1
        )
    );
  };

  /* =========================================
     SELECT DATE
  ========================================= */

  const handleDateSelect = (date) => {
    onChange(formatDate(date));

    setIsOpen(false);
    setView("calendar");
  };

  /* =========================================
     CLEAR DATE
  ========================================= */

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }

    setIsOpen(false);
    setView("calendar");
  };

  /* =========================================
     SELECT MONTH
  ========================================= */

  const selectMonth = (month) => {
    setViewDate(
      new Date(viewDate.getFullYear(), month, 1)
    );

    setView("calendar");
  };

  /* =========================================
     SELECT YEAR
  ========================================= */

  const selectYear = (year) => {
    setViewDate(
      new Date(year, viewDate.getMonth(), 1)
    );

    setView("calendar");
  };

  /* =========================================
     YEAR RANGE
  ========================================= */

  const startYear =
    Math.floor(viewDate.getFullYear() / 12) * 12;

  const years = Array.from(
    { length: 12 },
    (_, index) => startYear + index
  );

  /* =========================================
     CALENDAR DAYS
  ========================================= */

  const calendarDays = getCalendarDays(
    viewDate.getFullYear(),
    viewDate.getMonth()
  );

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
  ref={containerRef}
  className="relative z-[999] w-full sm:w-64"
>
   
      {/* DATE BUTTON */}

      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setView("calendar");
        }}
        className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:border-gray-500"
      >
        <span>
          {selectedDate
            ? formatDate(selectedDate)
            : "Select date"}
        </span>

        <span aria-hidden="true">▾</span>
      </button>

      {/* CALENDAR */}

      {isOpen && (
        <div className="absolute left-0 top-full z-[1000] mt-2 w-72 rounded-xl border border-gray-700 bg-gray-900 p-3 shadow-xl">
          {/* =====================================
              CALENDAR VIEW
          ===================================== */}

          {view === "calendar" && (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">

                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800 hover:text-white"
                  aria-label="Previous month"
                >
                  ‹
                </button>

                <div className="flex gap-1">

                  <button
                    type="button"
                    onClick={() => setView("months")}
                    className="rounded-md px-2 py-1 text-sm font-semibold text-gray-200 hover:bg-gray-800"
                  >
                    {MONTHS[viewDate.getMonth()]}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("years")}
                    className="rounded-md px-2 py-1 text-sm font-semibold text-gray-200 hover:bg-gray-800"
                  >
                    {viewDate.getFullYear()}
                  </button>

                </div>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800 hover:text-white"
                  aria-label="Next month"
                >
                  ›
                </button>

              </div>

              {/* WEEK DAYS */}

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">

                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-1 font-medium"
                  >
                    {day}
                  </div>
                ))}

              </div>

              {/* DAYS */}

              <div className="grid grid-cols-7 gap-1">

                {calendarDays.map(
                  ({ date, currentMonth }) => {
                    const dateValue = formatDate(date);

                    const isSelected =
                      value === dateValue;

                    const isToday =
                      formatDate(today) === dateValue;

                    return (
                      <button
                        key={dateValue}
                        type="button"
                        onClick={() =>
                          handleDateSelect(date)
                        }
                        className={`h-8 rounded-md text-sm transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : currentMonth
                              ? "text-gray-200 hover:bg-gray-800"
                              : "text-gray-600 hover:bg-gray-800 hover:text-gray-400"
                        } ${
                          isToday && !isSelected
                            ? "ring-1 ring-gray-500"
                            : ""
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  }
                )}

              </div>
            </>
          )}

          {/* =====================================
              MONTH VIEW
          ===================================== */}

          {view === "months" && (
            <>
              <div className="mb-3 flex items-center justify-between">

                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear() - 1,
                        viewDate.getMonth(),
                        1
                      )
                    )
                  }
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800"
                  aria-label="Previous year"
                >
                  ‹
                </button>

                <span className="text-sm font-semibold text-gray-200">
                  {viewDate.getFullYear()}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear() + 1,
                        viewDate.getMonth(),
                        1
                      )
                    )
                  }
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800"
                  aria-label="Next year"
                >
                  ›
                </button>

              </div>

              <div className="grid grid-cols-3 gap-2">

                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(index)}
                    className={`rounded-lg px-2 py-3 text-sm transition ${
                      index === viewDate.getMonth()
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}

              </div>
            </>
          )}

          {/* =====================================
              YEAR VIEW
          ===================================== */}

          {view === "years" && (
            <>
              <div className="mb-3 flex items-center justify-between">

                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear() - 12,
                        viewDate.getMonth(),
                        1
                      )
                    )
                  }
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800"
                  aria-label="Previous years"
                >
                  ‹
                </button>

                <span className="text-sm font-semibold text-gray-200">
                  {startYear} - {startYear + 11}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear() + 12,
                        viewDate.getMonth(),
                        1
                      )
                    )
                  }
                  className="rounded-md px-2 py-1 text-lg text-gray-300 hover:bg-gray-800"
                  aria-label="Next years"
                >
                  ›
                </button>

              </div>

              <div className="grid grid-cols-3 gap-2">

                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`rounded-lg px-2 py-3 text-sm transition ${
                      year === viewDate.getFullYear()
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {year}
                  </button>
                ))}

              </div>
            </>
          )}

          {/* CLEAR DATE */}

          <div className="mt-3 border-t border-gray-800 pt-2">

            <button
              type="button"
              onClick={handleClear}
              disabled={!value}
              className="w-full rounded-md px-2 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear date
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default DatePicker;