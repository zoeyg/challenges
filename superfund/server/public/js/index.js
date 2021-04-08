window.onload = () => {

  // Submit click handler for sending messages
  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault();

    // Build message post data
    const submitMsg = document.getElementById('message-form');
    let formData = new FormData(document.getElementsByTagName('FORM')[0]);
    const data = {};
    for (let kvp of formData.entries()) {
      data[kvp[0]] = kvp[1];
    }

    // Post to server
    fetch('/message', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => { // handle result
      if (result.error) {
        submitMsg.innerHTML = `Error: ${result.error}`;
      } else {
        submitMsg.innerHTML = "Message Sent";
        console.log(`Message ID: ${result.id}`);
      }
    })
    .catch(error => {
      submitMsg.innerHTML = `Error: ${error}`;
    });
  });
};