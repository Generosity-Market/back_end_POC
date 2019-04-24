const htmlHeader = (mailData) => (
    `<header>
        <img src="https://s3.amazonaws.com/generosity-market-mail-assets/White-Text-Generosity-Logo.png" />
        <p>Welcome ${mailData.email}</p>
    </header>`
);


module.exports = htmlHeader;