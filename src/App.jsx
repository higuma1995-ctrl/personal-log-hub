import { useEffect, useState } from "react";
import InputPage from "./pages/InputPage.jsx";
import ListPage from "./pages/ListPage.jsx";

export const CATEGORIES = ["日記", "仕事", "学習", "健康", "その他"];

function getPageFromHash() {
  return window.location.hash === "#/list" ? "list" : "input";
}

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPageFromHash());
    };

    if (!window.location.hash) {
      window.location.hash = "#/input";
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="appShell">
      <header className="appHeader">
        <p className="eyebrow">Personal Log Hub</p>
        <h1>日々の記録</h1>
      </header>

      <nav className="navTabs" aria-label="画面切替">
        <a className={page === "input" ? "active" : ""} href="#/input">
          入力
        </a>
        <a className={page === "list" ? "active" : ""} href="#/list">
          一覧
        </a>
      </nav>

      <main>{page === "list" ? <ListPage /> : <InputPage />}</main>
    </div>
  );
}
