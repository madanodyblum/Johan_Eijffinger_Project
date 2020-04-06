const BASEURL = 'https://eijffinger-api-dev.azurewebsites.net';
export default {
    GetToken: `${BASEURL}/api/Token`,  
    PostResetPassword: `${BASEURL}/api/Account/ResetPassword`,  
    GetOrdersData: `${BASEURL}/api/Orders`,
    GetUserData: `${BASEURL}/api/users/SearchUser?excludeInactiveUser=false`,
    PostUserData: `${BASEURL}/api/users/Create`,
    GetDeliveriesData: `${BASEURL}/api/SapFactory/execute/get/GetDeliveries`,
    GetReturnsData: `${BASEURL}/api/SapFactory/execute/get/GetReturns`,
    GetSalesInvoicesData: `${BASEURL}/api/SapFactory/execute/get/SalesInvoices`,
    GetCreditNotesData: `${BASEURL}/api/SapFactory/execute/get/CreditNotes`,
    GetInvoiceByDate: `${BASEURL}/api/SapFactory/execute/get/InvoiceByDate`,
    GetLastOrdersData: `${BASEURL}/api/SapFactory/execute/get/Latest5Orders`,
    GetLastDelivriesData: `${BASEURL}/api/SapFactory/execute/get/Latest5Deliverables`,
    GetLastOutstandingData: `${BASEURL}/api/SapFactory/execute/get/Latest5OutstandingInvoices`,
    PostActivateUser: `${BASEURL}/api/users/ActivateUser/`,
    PostDeaActivateUser: `${BASEURL}/api/users/DeactivateUser/`,
  };
  
  