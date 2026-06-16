import { ArrowRight, Scale, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import Card from "./Card";
import EmptyState from "./EmptyState";
import { Balance, Settlement } from "@/types";
import { formatCurrency } from "@/utils/calculations";

interface BalancesSectionProps {
  balances: Balance[];
  settlements: Settlement[];
  hasRoommates: boolean;
}

export default function BalancesSection({
  balances,
  settlements,
  hasRoommates,
}: BalancesSectionProps) {
  const EPSILON = 0.01;

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Scale size={18} className="text-primary-600" />
        Balances &amp; Settlements
      </h2>

      {!hasRoommates ? (
        <EmptyState
          icon={<Scale size={24} />}
          title="No data to calculate"
          description="Add roommates and expenses to see balances here."
        />
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              Individual Balances
            </h3>
            <ul className="space-y-2">
              {balances.map((b) => {
                const isSettled = Math.abs(b.net) <= EPSILON;
                const paidMore = b.net > EPSILON;
                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                          isSettled
                            ? "bg-slate-100 text-slate-400"
                            : paidMore
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {isSettled ? (
                          <CheckCircle2 size={16} />
                        ) : paidMore ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {b.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Paid {formatCurrency(b.paid)} · Share{" "}
                          {formatCurrency(b.share)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {isSettled ? (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          Settled
                        </span>
                      ) : paidMore ? (
                        <span className="text-sm font-semibold text-emerald-600">
                          +{formatCurrency(b.net)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-500">
                          -{formatCurrency(Math.abs(b.net))}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              Settlement Suggestions
            </h3>
            {settlements.length === 0 ? (
              <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  Everyone is settled up. No payments needed.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {settlements.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-primary-50 border border-primary-100 text-sm flex-wrap"
                  >
                    <span className="font-semibold text-slate-800">
                      {s.from}
                    </span>
                    <ArrowRight size={14} className="text-primary-500 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {s.to}
                    </span>
                    <span className="ml-auto font-bold text-primary-700 whitespace-nowrap">
                      {formatCurrency(s.amount)}
                    </span>
                    <span className="text-xs text-slate-500 w-full">
                      {s.from} should pay {formatCurrency(s.amount)} to {s.to}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
