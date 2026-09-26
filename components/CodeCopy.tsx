"use client";

import { useEffect } from "react";

const CLIPBOARD_ICON = '<i class="fa fa-clipboard" aria-hidden="true"></i>';
const DONE_ICON = '<i class="fa fa-check" aria-hidden="true"></i>';
const FAIL_ICON = '<i class="fa fa-times" aria-hidden="true"></i>';

/**
 * 给正文里的每个代码块补上右上角复制按钮。
 * 正文是构建期生成的静态 HTML，所以这里在挂载后包一层定位容器再插入按钮：
 * 按钮若直接放进 pre 内部，会跟随代码横向滚动，且会被手动框选复制进文本。
 */
export default function CodeCopy() {
  useEffect(() => {
    const article = document.querySelector("article.post-content");
    if (!article) return;

    const shells: HTMLDivElement[] = [];

    article.querySelectorAll("pre").forEach((pre) => {
      const shell = document.createElement("div");
      shell.className = "code-shell";
      pre.replaceWith(shell);
      shell.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", "复制代码");
      button.innerHTML = CLIPBOARD_ICON;

      button.addEventListener("click", async () => {
        // 按行取文本：代码块被 Shiki 拆成了带 data-line 的行元素，
        // 直接读 innerText 会受行内标签与空白折叠影响
        const lines = Array.from(pre.querySelectorAll("[data-line]"));
        const code =
          (lines.length > 0 ? lines.map((line) => line.textContent).join("\n") : pre.textContent) ??
          "";

        try {
          await navigator.clipboard.writeText(code);
          button.classList.add("is-copied");
          button.innerHTML = DONE_ICON;
        } catch {
          button.innerHTML = FAIL_ICON;
        }

        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.innerHTML = CLIPBOARD_ICON;
        }, 1500);
      });

      shell.appendChild(button);
      shells.push(shell);
    });

    return () => {
      shells.forEach((shell) => {
        const pre = shell.querySelector("pre");
        if (pre) shell.replaceWith(pre);
      });
    };
  }, []);

  return null;
}
