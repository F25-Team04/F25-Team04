
// This function accepts or declines the driver account application
// DRIVERID = id of the user that has applied for an account
// SPONSORID = id of the sponsor user that accepted of declined the account
// ACCEPTED = True if the application was accepted, False if the application was declined
function ApplicationDecision(DRIVER_ID, SPONSOR_ID, ACCEPTED) {
    body = {
        driver: DRIVER_ID,
        sponsor: SPONSOR_ID,
        accepted: ACCEPTED
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    fetch('https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/decisions', requestOptions)
        .then(response => {
        // Check if the request was successful (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the response body as JSON
        return response.json();
        })
    .catch(error => {
        // Handle any errors that occurred during the fetch operation
        console.error('There was a problem with the fetch operation:', error);
    });
}