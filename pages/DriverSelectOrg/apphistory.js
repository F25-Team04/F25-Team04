const params = new URLSearchParams(window.location.search);
const USER_ID = params.get('id');

window.onload = function () {
	async function GetApplications() {
		try {
			// Send POST request
			const response = await fetch(
				'https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application?id=' + USER_ID,
				{
					method: 'GET',
				}
			);
			if (response.ok) {
				const result = await response.json();
				if (response.success == false) {
					alert(result.message);
				} else if (response.status == 200) {
					console.log(result);
					CreateTable(result);
				}
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
	GetApplications();
	function CreateTable(apps) {
		var table = document.getElementById('app_table');
		for (let app of apps) {
			console.log(app);
			row = document.createElement('tr');
			data = document.createElement('td');
			data.innerText = app['Application ID'];
			row.appendChild(data);
			data = document.createElement('td');
			data.innerText = app['User ID'];
			row.appendChild(data);
			data = document.createElement('td');
			data.innerText = app['First Name'] + ' ' + app['Last Name'];
			row.appendChild(data);
			data = document.createElement('td');
			data.innerText = app['Organization Name'];
			row.appendChild(data);
			data = document.createElement('td');
			data.innerText = app['Date Created'];
			row.appendChild(data);
			data = document.createElement('td');
			if (app['Date Updated'] == null) {
				data.innerText = 'None';
			} else {
				data.innerText = app['Date Updated'];
			}
			row.appendChild(data);
			data = document.createElement('td');
			data.innerText = app['Status'];
			row.appendChild(data);

			table.appendChild(row);
		}
	}
};
