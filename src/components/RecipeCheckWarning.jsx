import React from 'react';

function RecipeCheckWarning({ recipeCheck }) {
  if (!recipeCheck || recipeCheck.ok) return null;

  return (
    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <span className="text-xl" aria-hidden>⚠</span>
        </div>
        <div>
          <h3 className="font-semibold text-red-900">Recipe Check: Feedstock balance</h3>
          <p className="mt-1 text-red-900">{recipeCheck.warning}</p>
          {recipeCheck.cNRatio != null && (
            <p className="mt-1 text-sm text-red-800">Current C:N ratio: {recipeCheck.cNRatio} (ideal 20–30)</p>
          )}
          {recipeCheck.recommendation && (
            <p className="mt-2 text-sm italic text-red-800">{recipeCheck.recommendation}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeCheckWarning;
