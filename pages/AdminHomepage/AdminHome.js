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
  li.appendChild(create_admin);
  li.appendChild(create);
  li.appendChild(create_org);
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
};
