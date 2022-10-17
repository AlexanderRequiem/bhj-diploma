/**
 * Класс TransactionsWidget отвечает за
 * открытие всплывающих окон для
 * создания нового дохода или расхода
 * */

class TransactionsWidget {
  /**
   * Устанавливает полученный элемент
   * в свойство element.
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * */
  constructor( element ) {
    if (!element) {
       throw new Error('element === undefined || element === null');
    }
    this.element = element;
    this.registerEvents();
  }
  
  /**
   * Регистрирует обработчики нажатия на
   * кнопки «Новый доход» и «Новый расход».
   * При нажатии вызывает Modal.open() для
   * экземпляра окна
   * */
  registerEvents() {
    this.element.onclick = e => {
      if (e.target.classList.contains('create-income-button')) {
        App.getModal('newIncome').open();
      }
      if (e.target.classList.contains('create-expense-button')) {
        App.getModal('newExpense').open();
      }
    }
  }
}
