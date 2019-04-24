const htmlBody = require('./body');

const subject = 'Thank you for your support';

const styles =
    `.donation_message span { 
        color: #008C49; 
    }

    .cause_wrapper {
        display: flex;
        flex-wrap: wrap;
    }

    .cause_item {
        width: 200px;
    }

    .cause_item img {
        width: 100%;
        height: auto;
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

    // Render each cause tile
    return causeList.map(listItem => (
        `<div class="cause_item">
            <img src=${listItem.mainImage} />
            <p>
                ${listItem.cause} • <span>$${listItem.amount}</span>
            </p>
        </div>`
    ));
}

// TODO Do things with the mailData
const htmlContent = (mailData) => (
    `<div>
        <h3>Welcome ${mailData.email}</h3>
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
        html: htmlBody(styles, htmlContent(mailData)),
    }
};