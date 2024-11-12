import { useResolve } from "ts-injecty";
import {
  GetDocumentByIdUseCase,
} from "@/v1/domain/usecases/get-document-by-id-use-case";
import { useDocument } from "@/v1/infrastructure/storage/DocumentStorage";
import { Segment } from "@/v1/domain/entities/document/Document";
import { useDataset } from "@/v1/infrastructure/storage/DatasetStorage";
import { waitForAsyncValue } from "@/v1/infrastructure/services/useWait";
import { useNotifications } from "~/v1/infrastructure/services/useNotifications";

export const useDocumentViewModel = () => {
  const notification = useNotifications();
  const getDocument = useResolve(GetDocumentByIdUseCase);
  const { state: dataset } = useDataset();
  const { state: document, set: setDocument, clear: clearDocument } = useDocument();

  const fetchDocumentByID = async (id: string) => {
    try {
      await getDocument.setDocumentByID(id);
    } catch (e) {
      notification.notify({
        message: `Error fetching document with ID ${id}`,
        type: 'danger',
      });
      clearDocument();
    }
  };

  const fetchDocumentByPubmedID = async (pmid: string) => {
    try {
      await getDocument.setDocumentByPubmedID(pmid);
    } catch (e) {
      notification.notify({
        message: `Error fetching document with pmid "${pmid}"`,
        type: 'danger',
      });
      clearDocument();
    }
  };

  const focusDocumentPageNumber = (pageNumber: number | string) => {
    // @ts-ignore
    setDocument({ ...document, page_number: pageNumber });
  };

  const fetchDocumentSegments = async (reference: string): Promise<Segment[]> => {
    try {
      await waitForAsyncValue(() => dataset.workspaceName);
      const segments = await getDocument.setSegments(dataset.workspaceName, reference);
      return segments;
    } catch (e) {
      notification.notify({
        message: `Error fetching document segments`,
        type: 'danger',
      });
    }
  };

  return {
    document,
    fetchDocumentByID,
    fetchDocumentByPubmedID,
    fetchDocumentSegments,
    focusDocumentPageNumber,
    clearDocument,
  };
};

export default useDocumentViewModel;