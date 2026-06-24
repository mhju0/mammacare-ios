import { useState } from "react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { AlertTriangle, X, Check } from "lucide-react";
import { IngredientIcon } from "../../components/IngredientIcon";
import type {
  Ingredient,
} from "./types";

// ─── Allergy Alert Modal ──────────────────────────────────────────────────────

interface AllergyAlertProps {
  ingredient: Ingredient;
  hasAllergy: boolean;
  isTesting?: boolean;
  onClose: () => void;
}

export function AllergyAlertModal({ ingredient, hasAllergy, isTesting, onClose }: AllergyAlertProps) {
  useBodyScrollLock();
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center pt-16 justify-center px-4" onClick={onClose}>
      <div className="bg-card rounded-3xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-base">알레르기 반응</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 py-4">
          <IngredientIcon name={ingredient.name} emoji={ingredient.emoji} className="w-14 h-14 sm:w-20 sm:h-20" />
          <div className="text-center">
            <div className="font-bold text-xl mb-2">{ingredient.name}</div>
            {isTesting ? (
              <div className="text-muted-foreground">테스트 중이에요</div>
            ) : hasAllergy ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="font-semibold">알레르기 반응이 있어요!</span>
              </div>
            ) : (
              <div className="text-muted-foreground">알레르기 반응이 없어요</div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-3xl text-primary-foreground font-bold
          bg-[radial-gradient(ellipse_at_center,#EBF7FF_0%,#C7E9FF_100%)]
          hover:bg-[radial-gradient(ellipse_at_center,#EBF7FF_0%,#B8E2FF_100%)]
          shadow-sm transition-all duration-300"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// ─── Allergy Testing Started Modal ───────────────────────────────────────────

export function AllergyTestingStartedModal({
  newIngredients,
  mealDate,
  onClose,
  onGoToAllergy,
}: {
  newIngredients: { name: string; emoji: string | null }[];
  mealDate?: Date;
  onClose: () => void;
  onGoToAllergy: () => void;
}) {
  useBodyScrollLock();
  const isFuture = mealDate != null && (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(mealDate);
    d.setHours(0, 0, 0, 0);
    return d > today;
  })();

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-borde p-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <h3 className="font-bold text-lg">알레르기 테스트 시작</h3>
          </div>
        </div>
        <p className="text-center text-base text-[#3D3C38] mb-3">
          {isFuture && mealDate ? (
            <>처음 등록된 재료가 입력하신 날짜 <br/>
            <span className="font-bold text-foreground">{mealDate.getMonth() + 1}월 {mealDate.getDate()}일</span>에 테스트 시작합니다.</>
          ) : (
            <>처음 등록된 재료가  <br/>
            <span className="font-bold text-foreground">'알레르기 테스트 진행 중'</span>으로 추가되었습니다.</>
          )}
        </p>
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {newIngredients.map((ing) => (
            <span key={ing.name} className="flex items-center gap-3 px-4 py-1 bg-[radial-gradient(ellipse_at_center,#FFFAF0_0%,#FFE8E0_100%)]
            border border-[#FF8763]/70 rounded-full text-primary-foreground text-lg font-semibold">
              <IngredientIcon name={ing.name} emoji={ing.emoji} className="w-4 h-4 sm:w-5 sm:h-5" />
              {ing.name}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border border-border text-base 
              font-semibold hover:bg-[radial-gradient(ellipse_at_center,#D4EEFF_0%,#DBF2FF_100%)] transition-colors">
            나중에 확인
          </button>
          <button onClick={onGoToAllergy} className="flex-1 py-3 rounded-full text-primary-foreground text-base font-bold 
                bg-[radial-gradient(ellipse_at_center,#EBF7FF_0%,#DBF2FF_50%,#D1EDFF_100%)] 
                hover:bg-[radial-gradient(ellipse_at_center,#D4EEFF_0%,#DBF2FF_100%)] transition-opacity disabled:opacity-40">
            알레르기 관리 보기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Select Testing Modal ─────────────────────────────────────────────────────

interface SelectTestingModalProps {
  ingredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
  onSkip: () => void;
}

export function SelectTestingModal({ ingredients, onSelect, onSkip }: SelectTestingModalProps) {
  useBodyScrollLock();
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4" onClick={onSkip}>
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h3 className="font-bold text-base">테스트할 재료를 선택해주세요</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          처음 등록되는 재료가 {ingredients.length}개입니다.<br />
          한 번에 1개만 테스트할 수 있어요.
        </p>
        <div className="space-y-2 mb-5">
          {ingredients.map((ing) => (
            <button
              key={ing.name}
              onClick={() => onSelect(ing)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 text-sm font-semibold text-left transition-all"
            >
              <IngredientIcon name={ing.name} emoji={ing.emoji} className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{ing.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onSkip}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
        >
          다시 입력하기
        </button>
      </div>
    </div>
  );
}

// ─── Active Testing Conflict Modal ───────────────────────────────────────────

interface ActiveTestingConflictModalProps {
  conflictingIngredientName: string;
  conflictEndDate: string;
  onReEnter: () => void;
}

export function ActiveTestingConflictModal({
  conflictingIngredientName,
  conflictEndDate,
  onReEnter,
}: ActiveTestingConflictModalProps) {
  useBodyScrollLock();
  const formatted = new Date(conflictEndDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#FFFAF0] border border-[#F8AC95] rounded-full">
            <AlertTriangle className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#F58462]" />
          </div>
        </div>
        <h3 className="font-bold text-base text-center mb-2">현재 진행중인 테스트가 있습니다</h3>
        <p className="text-center text-sm text-muted-foreground mb-1 leading-relaxed">
          <span className="font-semibold text-foreground">{conflictingIngredientName}</span> 테스트가
        </p>
        <p className="text-center text-sm text-muted-foreground mb-4 leading-relaxed">
          <span className="font-semibold text-foreground">{formatted}</span>까지 진행 중이에요.
        </p>
        <p className="text-center text-xs text-muted-foreground mb-6 leading-relaxed">
          테스트가 끝난 후 새로운 재료를 포함하는 식단을 등록해주세요.
        </p>
        <button
          onClick={onReEnter}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
        >
          식단 다시 만들기
        </button>
      </div>
    </div>
  );
}

// ─── Previous Testing Check Modal ────────────────────────────────────────────

interface PreviousTestingCheckModalProps {
  onHasTested: () => void;
  onNoTested: () => void;
}

export function PreviousTestingCheckModal({ onHasTested, onNoTested }: PreviousTestingCheckModalProps) {
  useBodyScrollLock();
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-[#EBF7FF] border border-[#B3DAF5] rounded-full">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#5BB6E8]" />
          </div>
        </div>
        <h3 className="font-bold text-lg text-center mb-2">이전에 테스트한 재료가 있나요?</h3>
        <p className="text-center text-base text-muted-foreground mb-4 leading-relaxed">
          알레르기 테스트 기록이 있다면 먼저<br />알레르기 관리 페이지에서 등록해주세요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onHasTested}
            className="flex-1 py-2.5 rounded-3xl bg-[radial-gradient(ellipse_at_center,#FFFAF0_0%,#FEF5CC_50%,#FFEFAB_100%)]
            text-[#3D3C38] text-sm font-bold hover:bg-[radial-gradient(ellipse_at_center,#FEF5CC_0%,#FFEFAB_100%)] transition-opacity"
          >
            있어요
          </button>
          <button
            onClick={onNoTested}
            className="flex-1 py-2.5 rounded-3xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            없어요
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Testing Date Conflict Modal ─────────────────────────────────────────────

export function TestingDateConflictModal({ onConfirm }: { onConfirm: () => void }) {
  useBodyScrollLock();
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#FFFAF0] border border-[#F8AC95] rounded-full">
            <AlertTriangle className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#F58462]" />
          </div>
        </div>
        <h3 className="font-bold text-lg text-center mb-2">테스트 날짜가 겹칩니다</h3>
        <p className="text-center text-base text-muted-foreground mb-6 leading-relaxed">
          식단을 다시 만들어주세요
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// ─── Allergy Warning Modal ────────────────────────────────────────────────────

type AllergyWarningVariant = "reaction" | "confirmed" | "suspected" | "mixed";

interface AllergyWarningModalProps {
  variant: AllergyWarningVariant;
  ingredientNames?: string[];        // reaction / confirmed / suspected 케이스
  reactionNames?: string[];          // mixed 케이스
  suspectedNames?: string[];         // mixed 케이스
  onPrimary: () => void;             // 예/등록하기/확인
  onSecondary?: () => void;          // 아니오/수정하기 (confirmed에는 없음)
}

const VARIANT_CONFIG: Record<
  AllergyWarningVariant,
  {
    iconBg: string;
    iconColor: string;
    title: string;
    primaryLabel: string;
    secondaryLabel?: string;
    primaryStyle: string;
  }
> = {
  reaction: {
    iconBg: "bg-[#FFFAF0] border-[#F8AC95]",
    iconColor: "text-[#F58462]",
    title: "알레르기 반응이 있던 재료입니다.\n식단에 추가할까요?",
    primaryLabel: "추가하기",
    secondaryLabel: "취소하기",
    primaryStyle:
      "bg-[radial-gradient(ellipse_at_center,#FFFAF0_0%,#FEF5CC_50%,#FFEFAB_100%)] text-[#3D3C38]",
  },
  confirmed: {
    iconBg: "bg-red-50 border-red-300",
    iconColor: "text-destructive",
    title: "알레르기 확진 재료입니다.\n식단 재구성 또는 재료를 수정해주세요.",
    primaryLabel: "확인",
    primaryStyle: 
      "bg-[radial-gradient(ellipse_at_center,#FFD9C9_0%,#FFC2B0_100%)] text-primary-foreground text-sm font-bold",
  },
  suspected: {
    iconBg: "bg-amber-50 border-amber-300",
    iconColor: "text-amber-600",
    title: "알레르기 반응이 있을 수 있어요.\n좀 더 주의하여 관찰해주세요.",
    primaryLabel: "등록하기",
    secondaryLabel: "수정하기",
    primaryStyle:
      "bg-[radial-gradient(ellipse_at_center,#FFFAF0_0%,#FEF5CC_50%,#FFEFAB_100%)] text-[#3D3C38]",
  },
  mixed: {
    iconBg: "bg-[#FFFAF0] border-[#F8AC95]",
    iconColor: "text-[#F58462]",
    title: "알레르기 반응이 있던 재료와\nAI 의심 재료가 포함되어 있습니다.\n식단에 추가할까요?",
    primaryLabel: "추가하기",
    secondaryLabel: "취소하기",
    primaryStyle:
      "bg-[radial-gradient(ellipse_at_center,#FFFAF0_0%,#FEF5CC_50%,#FFEFAB_100%)] text-[#3D3C38]",
  },
};

export function AllergyWarningModal({
  variant,
  ingredientNames = [],
  reactionNames = [],
  suspectedNames = [],
  onPrimary,
  onSecondary,
}: AllergyWarningModalProps) {
  useBodyScrollLock();
  const cfg = VARIANT_CONFIG[variant];

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center px-4">
      <div
        className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className={`p-3 border rounded-full ${cfg.iconBg}`}>
            <AlertTriangle className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${cfg.iconColor}`} />
          </div>
        </div>

        <h3 className="font-bold text-base text-center mb-3 whitespace-pre-line leading-snug">
          {cfg.title}
        </h3>

        {/* 재료 뱃지 */}
        {variant !== "mixed" && ingredientNames.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {ingredientNames.map((name) => (
              <span
                key={name}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  variant === "confirmed"
                    ? "bg-destructive/15 border-destructive/40 text-destructive"
                    : variant === "suspected"
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "bg-[#FFEEE8] border-[#FF8763]/40 text-[#FF8763]"
                }`}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* mixed 전용: 반응/의심 분리 표시 */}
        {variant === "mixed" && (
          <div className="space-y-2 mb-4">
            {reactionNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                <span className="text-xs text-muted-foreground w-full text-center mb-0.5">반응 재료</span>
                {reactionNames.map((name) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFEEE8] border border-[#FF8763]/40 text-[#FF8763]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            {suspectedNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                <span className="text-xs text-muted-foreground w-full text-center mb-0.5">AI 의심 재료</span>
                {suspectedNames.map((name) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-300 text-amber-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`flex gap-3 ${!cfg.secondaryLabel ? "" : ""}`}>
          {cfg.secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 py-2.5 rounded-3xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              {cfg.secondaryLabel}
            </button>
          )}
          <button
            onClick={onPrimary}
            className={`flex-1 py-2.5 rounded-3xl text-sm font-bold hover:opacity-90 transition-opacity ${cfg.primaryStyle}`}
          >
            {cfg.primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Allergy Test Confirm Modal (과거 날짜 식단 등록 시) ─────────────────────

export function AllergyTestConfirmModal({
  newIngredients,
  testingAllowed,
  onConfirm,
  onClose,
}: {
  newIngredients: { id?: number; name: string; emoji: string }[];
  testingAllowed: boolean;
  onConfirm: (safeIngredients: { id?: number; name: string }[], testingNames: string[]) => void;
  onClose: () => void;
}) {
  useBodyScrollLock();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const allConfirmed = checked.size === newIngredients.length;

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!testingAllowed && !allConfirmed) return;
    const safe = newIngredients.filter((i) => checked.has(i.name));
    const testingNames = testingAllowed
      ? newIngredients.filter((i) => !checked.has(i.name)).map((i) => i.name)
      : [];
    onConfirm(safe, testingNames);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl p-6 w-[400px] shadow-2xl border border-border flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div className="p-3 bg-[#EBF7FF] border border-[#B3DAF5] rounded-full">
            <Check className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#5BB6E8]" />
          </div>
        </div>
        <h3 className="font-bold text-base text-center">알레르기 테스트를 완료했나요?</h3>
        <p className="text-base text-muted-foreground text-center leading-snug">
          {testingAllowed ? (
            <>처음 등록된 재료예요.<br />이미 테스트를 완료한 재료를 체크해주세요.</>
          ) : (
            <>72시간이 지난 식단이에요.<br />실제로 먹고 반응이 없었던 재료를 모두 체크해주세요.</>
          )}
        </p>
        <div className="flex flex-col gap-2">
          {newIngredients.map((ing) => (
            <label
              key={ing.name}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <input
                type="checkbox"
                checked={checked.has(ing.name)}
                onChange={() => toggle(ing.name)}
                className="w-4 h-4 accent-primary rounded"
              />
              <IngredientIcon name={ing.name} emoji={ing.emoji || null} className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
              <span className="font-semibold text-base flex-1">{ing.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            나중에
          </button>
          <button
            onClick={handleConfirm}
            disabled={!testingAllowed && !allConfirmed}
            className="flex-1 py-2.5 rounded-full bg-[radial-gradient(ellipse_at_center,#EBF7FF_0%,#DBF2FF_50%,#D1EDFF_100%)] text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Multiple New Ingredients Modal ──────────────────────────────────────────

interface MultipleNewIngredientsModalProps {
  onConfirm: () => void;
}

export function MultipleNewIngredientsModal({ onConfirm }: MultipleNewIngredientsModalProps) {
  useBodyScrollLock();
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#FFFAF0] border border-[#F8AC95] rounded-full">
            <AlertTriangle className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#F58462]" />
          </div>
        </div>
        <h3 className="font-bold text-base text-center mb-2">새로운 재료가 2개 이상입니다</h3>
        <p className="text-center text-sm text-muted-foreground mb-6 leading-relaxed">
          테스트는 한 번에 1개 진행을 권장합니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          확인
        </button>
      </div>
    </div>
  );
}
