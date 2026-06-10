const DISH_LABELS = {
  主食: "主食",
  主菜: "主菜",
  副菜: "副菜"
};

export function TrayPreview({
  trayItems,
  loadingDishType,
  errorMessage,
  onRemoveTrayItem
}) {
  return (
    <aside className="tray-panel">
      <div className="tray-header">
        <h2>ご飯のイメージ</h2>
        <p>選んだレシピを主食・主菜・副菜のお皿に並べます。</p>
        {errorMessage ? <p className="tray-error-message">{errorMessage}</p> : null}
      </div>

      <div className="tray-board">
        {Object.entries(DISH_LABELS).map(([dishType, label]) => {
          const item = trayItems[dishType];
          const isLoading = loadingDishType === dishType;

          return (
            <div
              key={dishType}
              className={`tray-slot tray-slot-${dishType}`}
            >
              <span className="tray-slot-label">{label}</span>
              <div className="tray-plate">
                {isLoading ? (
                  <p className="tray-placeholder">料理画像を生成中...</p>
                ) : item ? (
                  <div className="tray-dish">
                    {item.imageUrl ? (
                      <button
                        type="button"
                        className="tray-dish-image-button"
                        onClick={() => onRemoveTrayItem(dishType)}
                        aria-label={`${item.name}をお盆から外す`}
                      >
                        <img
                          className="tray-dish-image"
                          src={item.imageUrl}
                          alt={`${item.name}のイメージ`}
                        />
                      </button>

) : (
                      <div className="tray-dish-image tray-dish-image-fallback">
                        <span>{item.name}</span>
                      </div>
                    )}
                    <span className="tray-dish-name">{item.name}</span>
                  </div>
                ) : (
                  <p className="tray-placeholder">
                    まだ{label}が選ばれていません
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
