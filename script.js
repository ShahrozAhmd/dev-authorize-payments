var formToken

const apiUrl =
  "https://api.leapcart.com/v1/payment-terminal/payment-transaction"

function getToken() {
  const postData = {
    ...(document.getElementById("email").value && {
      email: document.getElementById("email").value,
    }),
    amount: Number(document.getElementById("amount").value),
    invoiceNumber: document.getElementById("invoice").value,
  }

  if (!postData.amount) {
    alert("Amount is mendatory to enter !")
    document
      .getElementById("main_container")
      .classList.remove("main_container_hide")

    return
  } else if (postData.amount <= 0) {
    alert("Amount cant be 0 !")
    document
      .getElementById("main_container")
      .classList.remove("main_container_hide")

    return
  } else if (!postData.invoiceNumber) {
    alert("Invoice number is mendatory to enter !")
    document
      .getElementById("main_container")
      .classList.remove("main_container_hide")

    return
  } else {
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response data here
        formToken = data.token
        $("#popupToken").val(data.token)
        $("#inputtoken").val(data.token)
        var popup = document.getElementById("divAuthorizeNetPopup")
        var popupScreen = document.getElementById("divAuthorizeNetPopupScreen")
        var ifrm = document.getElementById("iframeAuthorizeNet")
        var form = document.forms["formAuthorizeNetPopup"]
        // $("#popupToken").val($("#inputtoken").val());
        form.action = "https://test.authorize.net/payment/payment"
        ifrm.style.width = "442px"
        ifrm.style.height = "578px"

        form.submit()

        popup.style.display = ""
        popupScreen.style.display = ""
        centerPopup()
      })
      .catch(error => {
        alert(error.messsage)
        document
          .getElementById("main_container")
          .classList.remove("main_container_hide")
      })
      .finally(() => {
        postData = {
          email: "",
          amount: "",
          invoiceNumber: "",
        }
        document.getElementById("email").value = ""
        document.getElementById("amount").value = ""
        document.getElementById("invoice").value = ""
      })
  }
}

if (!window.AuthorizeNetPopup) window.AuthorizeNetPopup = {}
if (!AuthorizeNetPopup.options)
  AuthorizeNetPopup.options = {
    onPopupClosed: null,
  }

AuthorizeNetPopup.closePopup = function () {
  document.getElementById("divAuthorizeNetPopupScreen").style.display = "none"
  document.getElementById("divAuthorizeNetPopup").style.display = "none"
  document.getElementById("iframeAuthorizeNet").src = "index.html"
  document.getElementById("btnOpenAuthorizeNetPopup").disabled = false
  if (AuthorizeNetPopup.options.onPopupClosed)
    AuthorizeNetPopup.options.onPopupClosed()
}

AuthorizeNetPopup.openPopup = function () {
  document.getElementById("main_container").classList.add("main_container_hide")
  // document
  //   .getElementById("loading_authorize_popup")
  //   .classList.add("loading_container_show")
  getToken()
}

AuthorizeNetPopup.onReceiveCommunication = function (querystr) {
  var params = parseQueryString(querystr)
  switch (params["action"]) {
    case "successfulSave":
      console.log("At Success:", querystr)
      AuthorizeNetPopup.closePopup()
      break
    case "cancel":
      console.log("At cancel:", querystr)
      window.parent.document.getElementById(
        "divAuthorizeNetPopup"
      ).style.display = "none"
      window.parent.document.getElementById("email").value = ""
      window.parent.document.getElementById("amount").value = ""
      window.parent.document.getElementById("invoice").value = ""
      window.parent.document.location.assign(
        "https://authorize-payments.vercel.app"
      )

      AuthorizeNetPopup.closePopup()
      break
    case "transactResponse":
      console.log("transactResponse", querystr)
      var response = params["response"]
      document.getElementById("token").value = response
      AuthorizeNetPopup.closePopup()
      break
    case "resizeWindow":
      console.log("resizeWindow", querystr)

      var w = parseInt(params["width"])
      var h = parseInt(params["height"])
      var ifrm = document.getElementById("iframeAuthorizeNet")
      ifrm.style.width = w.toString() + "px"
      ifrm.style.height = h.toString() + "px"
      centerPopup()
      break
  }
}

function centerPopup() {
  var d = document.getElementById("divAuthorizeNetPopup")
  d.style.left = "50%"
  d.style.top = "50%"
  var left = -Math.floor(d.clientWidth / 2)
  var top = -Math.floor(d.clientHeight / 2)
  d.style.marginLeft = left.toString() + "px"
  d.style.marginTop = top.toString() + "px"
  d.style.zIndex = "2"
  if (d.offsetLeft < 16) {
    d.style.left = "16px"
    d.style.marginLeft = "0px"
  }
  if (d.offsetTop < 16) {
    d.style.top = "16px"
    d.style.marginTop = "0px"
  }
}

function parseQueryString(str) {
  var vars = []
  var arr = str.split("&")
  var pair
  for (var i = 0; i < arr.length; i++) {
    pair = arr[i].split("=")
    vars.push(pair[0])
    vars[pair[0]] = unescape(pair[1])
  }
  return vars
}

document.getElementById("amount").addEventListener("keydown", event => {
  if (
    event.target.type != "Backspace" &&
    event.target.type === "number" &&
    (event.key === "-" ||
      event.key === "+" ||
      (event.key === 0 && event.target.value.length == 1))
  ) {
    event.preventDefault()
  }
})
