import assert from "node:assert/strict";
import test from "node:test";

import { faqCategories } from "@/data/faq";
import { footerColumns } from "@/data/footer-links";
import { infoPages, localInfoPaths } from "@/data/info-pages";

const normalizeLocalHref = (href: string) => {
  const [path] = href.split(/[?#]/);
  return path || "/";
};

test("info pages expose unique non-blog legacy paths with content", () => {
  const paths = infoPages.map((page) => page.path);
  assert.equal(new Set(paths).size, paths.length);

  for (const page of infoPages) {
    assert.ok(page.title.trim(), `${page.slug} has a title`);
    assert.ok(page.lead.trim(), `${page.slug} has a lead`);
    assert.ok(!page.path.startsWith("/blog/"), `${page.slug} must not be a blog page`);
    assert.ok(
      page.contentHtml.trim() || page.form,
      `${page.slug} has either imported content or a frontend form`,
    );
    assert.ok(!page.contentHtml.includes("browin-demo"), `${page.slug} has no demo copy`);
    assert.ok(!page.contentHtml.includes("<script"), `${page.slug} content is script-free`);
  }
});

test("regulamin keeps the reklamacje anchor used by the footer", () => {
  const regulamin = infoPages.find((page) => page.slug === "regulamin");

  assert.ok(regulamin);
  assert.ok(regulamin.contentHtml.includes('id="reklamacje"'));
});

test("footer local links resolve to implemented pages or catalog listings", () => {
  const implementedLocalPaths = new Set([
    ...localInfoPaths,
    "/sklep/nowosci",
    "/sklep/wyprzedaze",
  ]);

  for (const column of footerColumns) {
    for (const link of column.links) {
      if (link.href.startsWith("https://browin.pl/blog/")) {
        continue;
      }

      if (link.href.startsWith("https://browin.pl/static/download/")) {
        continue;
      }

      assert.ok(
        link.href.startsWith("/"),
        `${link.label} should be local unless it is an explicit blog/PDF link`,
      );

      const normalizedHref = normalizeLocalHref(link.href);
      assert.ok(
        implementedLocalPaths.has(normalizedHref),
        `${link.label} points to implemented path ${normalizedHref}`,
      );
    }
  }
});

test("FAQ is structured into categories and searchable answers", () => {
  assert.equal(faqCategories.length, 4);
  assert.equal(
    faqCategories.reduce((total, category) => total + category.questions.length, 0),
    56,
  );

  for (const category of faqCategories) {
    assert.ok(category.title.trim(), `${category.id} has title`);
    assert.ok(category.questions.length > 0, `${category.id} has questions`);

    for (const item of category.questions) {
      assert.ok(item.id.startsWith(category.id), `${item.question} has stable id`);
      assert.ok(item.question.trim(), `${item.id} has question`);
      assert.ok(item.answerHtml.trim(), `${item.id} has answer HTML`);
      assert.ok(item.answerText.trim(), `${item.id} has search text`);
    }
  }
});
