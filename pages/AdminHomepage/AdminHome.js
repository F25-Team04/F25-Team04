const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = "../AdminHomepage/AdminHome.html?id=" + USER_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const create = document.createElement("a");
  create.href = "../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
  create.textContent = "Create Sponsor";
  const create_org = document.createElement("a");
  create_org.href = "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
  create_org.textContent = "Create Organization";
  const create_admin = document.createElement("a");
  create_admin.href = "../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
  create_admin.textContent = "Create Admin";
    const bulk_load = document.createElement("a");
    bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
    bulk_load.textContent = "Bulk Loader";
    li.appendChild(create_admin);
    li.appendChild(create);
    li.appendChild(create_org);
    li.appendChild(bulk_load);
    list.appendChild(li);

  const createOrgButton = document.getElementById("create_org_btn");
  createOrgButton.addEventListener("click", function () {
    window.location.href =
      "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
  });

  const createSponsorButton = document.getElementById("create_sponsor_btn");
  createSponsorButton.addEventListener("click", function () {
    window.location.href =
      "../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
  });

  const manageSponsorsButton = document.getElementById("manage_sponsor_btn");
  manageSponsorsButton.addEventListener("click", function () {
    window.location.href =
      "../AdminAccManager/manage-sponsors/manage-sponsors.html?id=" + USER_ID;
  });

  const manageDriversButton = document.getElementById("manage_driver_btn");
  manageDriversButton.addEventListener("click", function () {
    window.location.href =
      "../AdminAccManager/manage-drivers/manage-drivers.html?id=" + USER_ID;
  });

  const manageAdminsButton = document.getElementById("manage_admin_btn");
  manageAdminsButton.addEventListener("click", function () {
    window.location.href =
      "../AdminAccManager/manage-admins/manage-admins.html?id=" + USER_ID;
  });
};
