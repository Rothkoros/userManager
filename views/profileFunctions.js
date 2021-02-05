function editUser(id){
    window.location = `/editUser?userid=${id}`


}
function deleteUser(id) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            window.location.reload();
        }
    };
    xhttp.open("POST", "/deleteUser", true);
    xhttp.setRequestHeader("userId", id);
    xhttp.send();
}
