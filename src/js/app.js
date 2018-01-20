App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function(){
    return App.initWeb3();
  },
  initWeb3: function(){
    if (typeof web3!=='undefined'){
      App.web3Provider=web3.currentProvider;
      web3=new Web3(web3.currentProvider);
    }else{
      App.web3Provider=new
      Web3.providers.HttpProvider('http://localhost:8545');
      web3=new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },
  displayAccountInfo: function(){
    web3.eth.getCoinbase(function(err,account){
      if (err===null){
        App.account=account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance){
          if (err===null){
              $("#accountBalance").text(web3.fromWei(balance,"ether")+" ETH");
          }
        });
      }
    });
  },
  initContract: function(){
    $.getJSON('ChainList.json',function(chainListArtifact){
        App.contracts.ChainList=TruffleContract(chainListArtifact);

        App.contracts.ChainList.setProvider(App.web3Provider);
        return App.reloadArticles();
    });
  },
  reloadArticles: function(){
    App.displayAccountInfo();
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.getArticle.call();
    }).then(function(article){
      if (article[0]==0x0){
        return;
      }
      var articleRow=$('#articleRow');
      articleRow.empty();
      var articleTemplate=$('#articleTemplate');
      articleTemplate.find('.panel-title').text(article[1]);
      articleTemplate.find('.article-description').text(article[2]);
      articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));
      var seller=article[0];
      if (seller==App.acount){
        seller="You";
      }
      articleTemplate.find('.article-seller').text(seller);
      articleRow.append(articleTemplate.html());
    }).catch(function(err){
      console.log(err.message);
    });
  },
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});
