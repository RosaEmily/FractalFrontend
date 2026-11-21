import { describe, expect, it } from "vitest";
import { sanitizeRichHtml, toRichHtml } from "@/shared/utils/rich-text";

describe("sanitizeRichHtml", () => {
  it.each([
    ["<p>a</p><script>alert(1)</script>", "<script"],
    ['<p onclick="x()">a</p>', "onclick"],
    ["<img src=x onerror=alert(1)>", "<img"],
    ['<a href="javascript:alert(1)">a</a>', "javascript:"],
    ['<p style="position:fixed;top:0">a</p>', "position"],
    ['<p style="background-color:url(javascript:x)">a</p>', "url("],
    ['<span style="font-family:Comic Sans">a</span>', "Comic"],
    ['<iframe src="https://evil.test"></iframe>', "<iframe"],
    ['<table onmouseover="x()"><tr><td onclick="y()">a</td></tr></table>', "on"],
    ['<table style="position:absolute"><tr><td style="background:url(x)">a</td></tr></table>', "style"],
    ["<table><tr><td><script>alert(1)</script></td></tr></table>", "<script"],
    ["<svg><style><img src=x onerror=alert(1)></style></svg>", "onerror"],
    ['<math><mi xlink:href="javascript:alert(1)">x</mi></math>', "javascript:"],
  ])("elimina %s", (input, forbidden) => {
    expect(sanitizeRichHtml(input).toLowerCase()).not.toContain(forbidden.toLowerCase());
  });

  it("conserva el formato del editor", () => {
    const html = sanitizeRichHtml(
      '<h2 style="text-align:center">T</h2><p><strong>a</strong><span style="color:#ff0000;font-size:18px;font-family:Georgia">b</span></p><ul><li>x</li></ul><span style="line-height:1.5">l</span><sub>1</sub><code>k</code>',
    );
    expect(html).toContain("line-height:1.5");
    expect(html).toContain("<sub>1</sub>");
    expect(html).toContain("text-align:center");
    expect(html).toContain("color:#ff0000");
    expect(html).toContain("font-size:18px");
    expect(html).toContain("<strong>a</strong>");
    expect(html).toContain("<li>x</li>");
  });

  it("conserva tablas", () => {
    const html = sanitizeRichHtml('<table><tbody><tr><th colspan="2">H</th></tr><tr><td><p>a</p></td><td rowspan="2">b</td></tr></tbody></table>');
    expect(html).toContain('<th colspan="2">');
    expect(html).toContain('<td rowspan="2">');
  });

  it("acota ancho y span de celdas", () => {
    const html = sanitizeRichHtml('<table><tr><td width="200" colspan="2">a</td><td width="99999" colspan="9999">b</td><td width="50%">c</td></tr></table><p width="300">x</p>');
    expect(html).toContain('<td width="200" colspan="2">');
    expect(html).not.toContain("99999");
    expect(html).not.toContain("9999");
    expect(html).not.toContain("50%");
    expect(html).not.toContain("width=\"300\"");
  });

  it("el texto SQL queda como texto inerte", () => {
    expect(sanitizeRichHtml("<p>'; DROP TABLE users; --</p>")).toContain("DROP TABLE users");
  });

  it("enlace externo lleva rel seguro", () => {
    expect(sanitizeRichHtml('<a href="https://e.com" target="_blank">a</a>')).toContain('rel="noopener noreferrer"');
  });
});

describe("toRichHtml", () => {
  it("convierte el Markdown viejo", () => {
    expect(toRichHtml("## Título\n\nHola **mundo**")).toBe("<h3>Título</h3>\n<p>Hola <strong>mundo</strong></p>");
  });
  it("deja pasar HTML saneado", () => {
    expect(toRichHtml("<p>Hola</p><script>x</script>")).toBe("<p>Hola</p>");
  });
});
