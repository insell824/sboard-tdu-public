var app = new Vue({
  el: '#app',
  data: {
    id: "",
    pass: "",
    idError: "",
    passError: "",
    isLoading: false,
    isAutoSignin: true,
  },
  methods: {
    signin: function () {
      if(this.isLoading){
        return;
      }
      if (this.id == "" || this.pass == "") {
        if (this.pass == "") {
          this.passError = "必須項目です";
          this.$nextTick(() => {
            this.$refs.pass.focus();
          });
        } else {
          this.passError = "";
        }
        if (this.id == "") {
          this.idError = "必須項目です";
          this.$nextTick(() => {
            this.$refs.id.focus();
          });
        } else {
          this.idError = "";
        }
        return;
      }
      this.isLoading = true;
      axios.post('signin', {
        id: this.id,
        pass: this.pass,
        auto: this.isAutoSignin
      }).then(function (res) {
        if(res.data.status){
          if(this.isAutoSignin){
            Cookies.set('sessionKey', res.data.body.sessionKey);
          }
          var redirect = sessionStorage.getItem('redirect');
          if(redirect== null){
            redirect = '/';
          }
          location.href = redirect;
        }else{
          this.idError = "";
          this.passError = res.data.statusTextJP;
          console.error(res.data.statusText);
          this.isLoading = false;
        }
      }.bind(this)).catch(function (error) {
        this.isLoading = false;
        this.passError = "不明なエラー";
        this.$nextTick(() => {
          this.$refs.pass.focus();
          this.$refs.pass.select()
        });
      }.bind(this));
    }
  }
});