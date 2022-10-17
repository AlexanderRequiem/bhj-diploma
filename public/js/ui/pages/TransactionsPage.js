/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor( element ) {
    if (element === undefined || element === null) {
      throw new Error('element === undefined || element === null');
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    this.element.querySelector('.remove-account').onclick = e => {
      e.preventDefault();
      this.removeAccount();
    }

    this.element.onclick = e => {
      if (e.target.classList.contains('fa-trash')) {
        let btn = e.target;
        this.removeTransaction({id: btn.closest('.transaction__remove').dataset.id});
      }
      e.preventDefault();
    }
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (this.lastOptions === undefined) {
      return;
    }

    if (confirm('Вы действительно хотите удалить счёт?')) {
      Account.remove({id : this.lastOptions.account_id}, (err, resp) => {
        if (resp && resp.success) {
          App.updateWidgets();
          App.updateForms();
        }
      });

      this.clear();
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction( id ) {
    if (confirm('Вы действительно хотите удалить эту транзакцию?')) {
      Transaction.remove(id, (err, resp) => {
        if (resp && resp.success) {
          App.update();
        }
      });
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options){
    if (options === undefined) {
      return;
    }
    this.lastOptions = options;

    Account.get(options.account_id, (err, resp) => {
      if(resp && resp.success) {
        this.element.querySelector('.content-title').textContent = resp.data.name;
      }
    });

    Transaction.list(options, (err, resp) => {
      if (resp && resp.success) {
        this.renderTransactions(resp.data);
      }
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle("Название счёта");
    this.lastOptions = undefined;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    this.element.querySelector('.content-title').textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date){
    const objDate = new Date(date);
    let formatter = new Intl.DateTimeFormat("ru", {
      //weekday: "none",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const hours = objDate.getHours() > 9 ? `${objDate.getHours()}` : `0${objDate.getHours()}`;
    const minutes = objDate.getMinutes() > 9 ? `${objDate.getMinutes()}` : `0${objDate.getMinutes()}`;
    const result = formatter.format(objDate) + ` в ${hours}:${minutes}`;
    return result;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){

    const divMain = document.createElement('div');
    divMain.classList.add('transaction');
    divMain.classList.add(`transaction_${item.type}`);
    divMain.classList.add('row');

    const divDetails = document.createElement('div');
    divDetails.innerHTML = 
    '<div class="col-md-7 transaction__details">' +
      '<div class="transaction__icon">'+
        '<span class="fa fa-money fa-2x">'+
        '</span>'+
      '</div>'+ 
      '<div class="transaction__info">'+
        '<h4 class="transaction__title">'+ item.name + '</h4>' + 
        '<div class="transaction__date">' + 
          this.formatDate(item.created_at) +
        '</div>'+
      '</div>'+
    '</div>';
    divMain.appendChild(divDetails);

    const divSumm = document.createElement('div');
    divSumm.innerHTML = 
    '<div class="col-md-3">'+
      '<div class="transaction__summ">'+
        item.sum +
        '<span class="currency">'+
          '₽'+
        '</span>'+
      '</div>'+
    '</div>';
    divMain.appendChild(divSumm);

    const divControls = document.createElement('div');
    divControls.innerHTML = 
    '<div class="col-md-2 transaction__controls">'+
      '<button class="btn btn-danger transaction__remove" data-id="'+ item.id+'">'+
        '<i class="fa fa-trash">'+
        '</i>'+
      '</button>'+
    '</div>';
    divMain.appendChild(divControls);
    return divMain.outerHTML;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    const targetElement = this.element.querySelector('.content');
    targetElement.querySelectorAll('.transaction').forEach(item=>item.remove());
    data.forEach(item => targetElement. insertAdjacentHTML('beforeend', this.getTransactionHTML(item)));
  }
}