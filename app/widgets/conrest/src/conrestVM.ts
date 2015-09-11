module ConRESTVMS {
  import Session = Models.Session;

  export class ConRESTVM {
    static $inject = ['$scope', 'session', '$routeParams', '$mdSidenav'];
    session: Session;
    $routeParams: any;
    $mdSidenav: any;

    constructor($scope, session: Session, $routeParams, $mdSidenav) {
      this.session = session;
      this.$routeParams = $routeParams;
      this.$mdSidenav = $mdSidenav;
      $scope.vm = this;
      session.workflow = null;
      session.calls = null;
      session.connector = null;
      session.mapper = null;
    }

    toggleMenu(navID : string) {
      this.$mdSidenav(navID).toggle();
    }

    close() {
      this.$mdSidenav('left').close();
    }

  }
}
