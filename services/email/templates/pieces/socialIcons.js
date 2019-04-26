const fb = {
    url: 'https://www.facebook.com/GenerosityMarket/',
    imageSrc: 'https://s3.amazonaws.com/generosity-market-mail-assets/iconmonstr-facebook-5-48.png',
};
const ig = {
    url: 'https://www.instagram.com/generositymarket/',
    imageSrc: 'https://s3.amazonaws.com/generosity-market-mail-assets/iconmonstr-instagram-15-48.png',
};
const tw = {
    url: 'https://twitter.com/generositymarkt',
    imageSrc: 'https://s3.amazonaws.com/generosity-market-mail-assets/iconmonstr-twitter-5-48.png',
};

const iconLink = (icon) => (
    `<a
        href=${icon.url}
        target="_blank"
        rel="no-follow"
        class="social_links"
    >
        <img src=${icon.imageSrc} />
    </a>`
);

module.exports = {
    facebook: iconLink(fb),
    instagram: iconLink(ig),
    twitter: iconLink(tw),
};