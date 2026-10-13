#include <iostream>
#include <omp.h>
using namespace std;

int main() {
    #pragma omp parallel num_threads(4)
    {
        cout << "Hello from thread "
             << omp_get_thread_num() << endl;
    }
    return 0;
}
