"use client";

import { useEffect, useState } from "react";

import {
  DISCOUNT_TIMER_MS,
  readSpinDiscount,
  type SpinDiscount,
} from "./discount-spinner";

export function useOfferDiscount() {
  const [discount, setDiscount] = useState<SpinDiscount | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [countdownMs, setCountdownMs] = useState(0);

  useEffect(() => {
    const existing = readSpinDiscount();
    if (existing) setDiscount(existing);
    else setShowSpinner(true);
  }, []);

  useEffect(() => {
    if (!discount) return;
    const tick = () =>
      setCountdownMs(
        Math.max(0, discount.claimedAt + DISCOUNT_TIMER_MS - Date.now()),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [discount]);

  function claimDiscount(won: SpinDiscount) {
    setDiscount(won);
    setShowSpinner(false);
  }

  return { countdownMs, discount, showSpinner, claimDiscount };
}
