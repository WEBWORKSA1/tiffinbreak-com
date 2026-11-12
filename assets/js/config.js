/* TiffinBreak.com site configuration. This is the only file you need to edit for links and prizes. */
window.TB_CONFIG = {
  /* Encoded form-relay key (reversed, then base64). The inbox address never appears in page source. */
  relay: "bW9jLmxpYW1nQDFhc2tyb3diZXc=",
  /* After the first FormSubmit activation email, paste the random alias it gives you here (optional). */
  formAlias: "",
  /* Donation / payment links. Paste URLs to switch the Support page from pledge mode to instant checkout.
     Examples: "https://paypal.me/yourname", "https://buy.stripe.com/xxxx", "https://www.buymeacoffee.com/you",
     "https://ko-fi.com/you", "https://rzp.io/l/xxxx", "upi://pay?pa=yourid@bank&pn=TiffinBreak" */
  payments: {
    paypal: "",
    stripe: "",
    buymeacoffee: "",
    kofi: "",
    razorpay: "",
    upi: ""
  },
  /* Monthly challenge prizes, first to third place. */
  prizes: ["US$100 gift card + featured recipe", "US$50 gift card", "US$25 gift card"],
  /* Kitchen listing plans shown on list-your-kitchen.html (launch rates). */
  listing: { featured: "CA$39 / month", spotlight: "CA$99 / month", lead: "CA$12 per matched request" },
  /* Reply-time promise shown after lead submissions. */
  replyTime: "within one business day"
};
