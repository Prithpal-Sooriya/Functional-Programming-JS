/* ----- Utilities (impure segregated) ------ */
const url = t => `${t}`;
const toJson = text => text.json();
const errHandler = err => {};

const Impure = {
  getJSON: R.curry((callback, url) =>
    fetch(url).then(toJson).then(callback).catch(errHandler)),

  setHtml: R.curry((selector, html) => {
    const x = document.querySelector(selector)
    x.innerHTML = html;
  }),

  trace: R.curry((tag, x) => {
    console.log(tag, x);
    return x;
  })
};

/* ----- Pure ----- */
const img = (src) => {
  const elm =  document.createElement('img');
  elm.setAttribute('src', src);
  return elm.outerHTML;
}
const mediaUrl = R.prop('url');
const mediaUrlToImg = R.compose(img, mediaUrl);
const images = R.compose(R.map(mediaUrlToImg), R.prop('value'))

/* ----- Impure ----- */
const render = R.compose(Impure.setHtml('#js-main'), images);
const app = R.compose(Impure.getJSON(render), url)
app('./images.json')