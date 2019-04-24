const htmlHeader = require('./pieces/header.js');
const htmlFooter = require('./pieces/footer.js');
const htmlStyles = require('./pieces/styles.js');

const htmlBody = (contentStyles, bodyContent) => (
    `<html>
        <head>
            <style>
                ${htmlStyles}
                ${contentStyles}
            </style>
        </head>
        <body>
            <div class="wrapper">
                ${htmlHeader}
                ${bodyContent}
                ${htmlFooter}
            </div>
        </body>
    </html>`
);


module.exports = htmlBody;