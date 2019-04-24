const htmlBody = require('./body');

const subject = 'Thank you for your support';

const styles = `
    .donation_message span,
    .cause_item span { 
        color: #008C49; 
    }
    .cause_wrapper {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        margin: 50px 0;
        width: 100%;
    }
    .cause_item {
        border-radius: 5px;
        box-shadow: 3px 3px 5px rgba(0,0,0,0.2);
        height: 130px;
        margin: 8px;
        padding-bottom: 10px;
        width: 180px;
    }
    .cause_item .title {
        margin-bottom: 5px;
    }
    .cause_item .image {
        background-position: center;
        background-size: cover;
        overflow: hidden;
        width: 180px;
        height: 115px;
    }`;


const renderCauses = (cart) => {
    let causeList = [];

    cart.forEach(cartItem => {
        const causeAlreadyListed = causeList.filter(e => e.cause === cartItem.cause).length > 0;

        if (!causeAlreadyListed) {
            causeList.push(cartItem);
        } else {
            // Find out the index within the causeList
            const index = causeList.findIndex(x => x.cause === cartItem.cause);
            // Add cartItem amount to the correct cause
            causeList[index].amount = causeList[index].amount + cartItem.amount;
        }
    });

    let html = ``;
    // Render each cause tile
    causeList.map(listItem => {
        html = html + `
        <div class="cause_item">
            <div class="image" style="background-image: url(${listItem.mainImage});"></div>
            <p class="title">
                ${listItem.cause} - <span>$${listItem.amount}</span>
            </p>
        </div>`
    });

    return html;
}

const htmlContent = (mailData) => (
    `<div>
        <p>Thank you for supporting these great causes</p>

        <div class="cause_wrapper">
            ${renderCauses(mailData.cart)}
        </div>

        <p class="donation_message">
            Your donation amount: <span>$${mailData.amount / 100}</span>
        </p>
        <p>
            Click to view your 
            <a href="${mailData.receipt_url}">
                Stripe Receipt
            </a>
        </p>
    </div>`
);


exports.template = (mailData) => {
    // console.log('HTML Body: ', htmlBody(styles, htmlContent(mailData)));
    // console.log("MailData: ", mailData);

    return {
        subject,
        html: htmlBody(styles, htmlContent, mailData),
    }
};